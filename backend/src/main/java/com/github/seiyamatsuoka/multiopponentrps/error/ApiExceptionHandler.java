package com.github.seiyamatsuoka.multiopponentrps.error;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * APIの例外ハンドリング。
 *
 * <p>目的：
 *
 * <ul>
 *   <li>バリデーション失敗（@Valid）時のレスポンスを最小のJSON形式に統一する
 *   <li>JSONの形式不正・enum不正などの入力エラーも同様に 400 として返す
 *   <li>想定外は 500 でメッセージを返す（詳細はログ）
 * </ul>
 */
@RestControllerAdvice
public class ApiExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

  /**
   * リクエストボディのバリデーションエラー（@Valid）を 400 で返す。
   *
   * @param ex バリデーション例外
   * @return 400 + 統一エラーレスポンス
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    List<String> details = new ArrayList<>();
    // FieldError はどのフィールドがどんな理由でエラーかを保持している
    for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
      String field = fe.getField();
      String message = Objects.toString(fe.getDefaultMessage(), "不正な値です");
      details.add(field + ": " + message);
    }

    ApiErrorResponse body = new ApiErrorResponse("入力が不正です", details);
    return ResponseEntity.badRequest().body(body);
  }

  /**
   * JSONの形式不正や enum 変換失敗などを 400 で返す。
   *
   * @param ex JSONパース/変換例外
   * @return 400 + 統一エラーレスポンス
   */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
    List<String> details = buildDetailsForNotReadable(ex);

    ApiErrorResponse body = new ApiErrorResponse("リクエストボディが不正です", details);
    return ResponseEntity.badRequest().body(body);
  }

  /**
   * 想定外の例外を 500 で返す（詳細はログ出力）。
   *
   * @param ex 想定外の例外
   * @return 500 + 統一エラーレスポンス
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
    // 利用者向けではなく、ログに詳細を残す
    log.error("想定外のエラーが発生しました", ex);

    ApiErrorResponse body = new ApiErrorResponse("サーバーでエラーが発生しました", List.of());
    return ResponseEntity.internalServerError().body(body);
  }

  /**
   * HttpMessageNotReadableException の詳細メッセージを組み立てる。
   *
   * <ul>
   *   <li>enum不正（例：hand:"xxx"）の場合に「どの項目が不正か」を出す
   *   <li>それ以外は「JSON形式が不正」程度に留める
   * </ul>
   *
   * @param ex 例外
   * @return details
   */
  private List<String> buildDetailsForNotReadable(HttpMessageNotReadableException ex) {
    Throwable cause = ex.getCause();

    // enumの変換失敗は Jackson の InvalidFormatException で拾う
    if (cause instanceof InvalidFormatException ife) {
      if (ife.getTargetType() != null && ife.getTargetType().isEnum()) {
        String fieldName = extractLastFieldName(ife);
        if (fieldName != null && !fieldName.isBlank()) {
          return List.of(fieldName + ": 値が不正です");
        }
        return List.of("値が不正です");
      }
    }

    // それ以外は最小限の案内のみ
    return List.of("JSONの形式が不正です");
  }

  /**
   * Jackson例外の path から、最後のフィールド名を取り出す。
   *
   * @param ife InvalidFormatException
   * @return フィールド名（取得できない場合は null）
   */
  private String extractLastFieldName(InvalidFormatException ife) {
    if (ife.getPath() == null || ife.getPath().isEmpty()) {
      return null;
    }
    var last = ife.getPath().get(ife.getPath().size() - 1);
    return last.getFieldName();
  }
}

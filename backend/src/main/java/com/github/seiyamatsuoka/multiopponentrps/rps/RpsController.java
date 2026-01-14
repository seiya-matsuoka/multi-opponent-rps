package com.github.seiyamatsuoka.multiopponentrps.rps;

import com.github.seiyamatsuoka.multiopponentrps.rps.dto.RpsRequest;
import com.github.seiyamatsuoka.multiopponentrps.rps.dto.RpsResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * じゃんけんAPI（Controller）。
 *
 * <p>入力のバリデーションは {@link jakarta.validation.Valid} により行う。
 */
@RestController
@RequestMapping("/api")
public class RpsController {

  private final RpsService rpsService;

  /**
   * DIコンストラクタ。
   *
   * @param rpsService じゃんけんロジック（Service）
   */
  public RpsController(RpsService rpsService) {
    this.rpsService = rpsService;
  }

  /**
   * じゃんけんを実行する。
   *
   * @param request リクエストDTO（hand必須、opponents 1〜10）
   * @return 対戦結果（相手ごとの結果と集計）
   */
  @PostMapping("/rps")
  public RpsResponse play(@Valid @RequestBody RpsRequest request) {
    // request 内の制約（hand必須、opponents範囲）は @Valid により担保
    return rpsService.play(request.hand(), request.opponents());
  }
}

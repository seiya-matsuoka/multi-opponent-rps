package com.github.seiyamatsuoka.multiopponentrps.error;

import java.util.List;

/**
 * APIのエラーレスポンスDTO。
 *
 * @param message エラーの大枠メッセージ
 * @param details 詳細メッセージ一覧（空でも可）
 */
public record ApiErrorResponse(String message, List<String> details) {}

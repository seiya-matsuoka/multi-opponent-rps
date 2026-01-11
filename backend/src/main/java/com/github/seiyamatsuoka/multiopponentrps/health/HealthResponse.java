package com.github.seiyamatsuoka.multiopponentrps.health;

/**
 * ヘルスチェックAPIのレスポンスDTO。
 *
 * <p>Renderのコールドスタート対策（ウォームアップ）および疎通確認のために利用する。
 */
public record HealthResponse(String status) {
  /** 正常時のステータス値。 */
  public static final String STATUS_OK = "ok";

  /**
   * 正常（ok）のレスポンスを生成する。
   *
   * @return status が "ok" のレスポンス
   */
  public static HealthResponse ok() {
    return new HealthResponse(STATUS_OK);
  }
}

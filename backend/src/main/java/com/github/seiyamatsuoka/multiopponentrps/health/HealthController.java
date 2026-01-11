package com.github.seiyamatsuoka.multiopponentrps.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ヘルスチェックAPI。
 *
 * <p>サーバーの起動確認やRenderのコールドスタート対策（ウォームアップ）として呼び出す。
 */
@RestController
@RequestMapping("/api")
public class HealthController {

  /**
   * サーバーが応答可能であることを示す。
   *
   * @return {"status":"ok"}
   */
  @GetMapping("/health")
  public HealthResponse health() {
    // 起動して応答できればOKとする。
    return HealthResponse.ok();
  }
}

package com.github.seiyamatsuoka.multiopponentrps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** multi-opponent-rps バックエンドアプリケーションのエントリポイント。 */
@SpringBootApplication
public class MultiOpponentRpsApplication {

  /**
   * Spring Boot アプリケーションを起動する。
   *
   * @param args コマンドライン引数
   */
  public static void main(String[] args) {
    SpringApplication.run(MultiOpponentRpsApplication.class, args);
  }
}

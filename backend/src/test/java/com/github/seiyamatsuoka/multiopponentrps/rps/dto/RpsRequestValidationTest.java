package com.github.seiyamatsuoka.multiopponentrps.rps.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.github.seiyamatsuoka.multiopponentrps.rps.model.Hand;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * RpsRequest のバリデーション確認テスト。
 *
 * <p>DTO単体で制約が効いていることを最小限チェックする。
 */
class RpsRequestValidationTest {

  private static ValidatorFactory factory;
  private static Validator validator;

  @BeforeAll
  static void setUp() {
    factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();
  }

  @AfterAll
  static void tearDown() {
    factory.close();
  }

  // 正常系：hand と opponents が仕様どおりの値のとき、バリデーション違反が0件であること
  @Test
  void validRequest_hasNoViolations() {
    RpsRequest request = new RpsRequest(Hand.ROCK, 3);

    Set<ConstraintViolation<RpsRequest>> violations = validator.validate(request);

    // 期待：制約違反がない
    assertThat(violations).isEmpty();
  }

  // 異常系：hand が未指定（null）のとき、@NotNull によりバリデーション違反が発生すること
  @Test
  void handIsNull_hasViolation() {
    RpsRequest request = new RpsRequest(null, 3);

    Set<ConstraintViolation<RpsRequest>> violations = validator.validate(request);

    // 期待：制約違反が1件以上ある
    assertThat(violations).isNotEmpty();
  }

  // 異常系：opponents が許容範囲外のとき、@Min/@Max によりバリデーション違反が発生すること（0 は最小値(1)未満、11 は最大値(10)超過）
  @Test
  void opponentsOutOfRange_hasViolation() {
    RpsRequest tooSmall = new RpsRequest(Hand.ROCK, 0);
    RpsRequest tooLarge = new RpsRequest(Hand.ROCK, 11);

    Set<ConstraintViolation<RpsRequest>> v1 = validator.validate(tooSmall);
    Set<ConstraintViolation<RpsRequest>> v2 = validator.validate(tooLarge);

    // 期待：範囲外は制約違反が1件以上ある
    assertThat(v1).isNotEmpty();
    assertThat(v2).isNotEmpty();
  }
}

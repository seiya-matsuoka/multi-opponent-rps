package com.github.seiyamatsuoka.multiopponentrps.rps;

import com.github.seiyamatsuoka.multiopponentrps.rps.dto.RpsResponse;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Hand;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Result;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.RoundResult;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Summary;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

/**
 * じゃんけんのロジック（サービス層）。
 *
 * <p>責務：
 *
 * <ul>
 *   <li>相手の手を人数分ランダム生成する
 *   <li>自分の手と相手の手から勝敗を判定する
 *   <li>相手ごとの結果一覧と集計を作成する
 * </ul>
 *
 * <p>注意：
 *
 * <ul>
 *   <li>入力（hand/opponents）のバリデーションは Controller 側で行う前提
 *   <li>テストを安定させるため、ランダム生成を使わない入口（playWithOpponentHands）も用意する
 * </ul>
 */
@Service
public class RpsService {

  /**
   * じゃんけんを実行する（相手の手はランダムに生成）。
   *
   * @param playerHand 自分の手（null不可）
   * @param opponents 相手人数（1以上を想定）
   * @return 対戦結果（相手ごとの結果と集計を含む）
   */
  public RpsResponse play(Hand playerHand, int opponents) {
    Objects.requireNonNull(playerHand, "playerHand は必須です");

    // Controller 側で 1〜10 を保証する前提のため、ここでは opponents の範囲チェックは行わない。
    List<Hand> opponentHands = generateOpponentHands(opponents);

    // ランダム生成した相手の手を使って、共通ロジックで結果を組み立てる
    return playWithOpponentHands(playerHand, opponentHands);
  }

  /**
   * じゃんけんを実行する（相手の手を指定）。
   *
   * <p>テスト時の入口に使用することで、ランダム性を排除して、判定・集計の正しさを安定して検証できるようにする。
   *
   * @param playerHand 自分の手（null不可）
   * @param opponentHands 相手の手の一覧（null不可）
   * @return 対戦結果（相手ごとの結果と集計を含む）
   */
  RpsResponse playWithOpponentHands(Hand playerHand, List<Hand> opponentHands) {
    Objects.requireNonNull(playerHand, "playerHand は必須です");
    Objects.requireNonNull(opponentHands, "opponentHands は必須です");

    // 相手人数分の結果を格納する。サイズが分かっているので初期容量を指定しておく。
    List<RoundResult> results = new ArrayList<>(opponentHands.size());

    // 集計は int カウンタで管理する
    int win = 0;
    int lose = 0;
    int draw = 0;

    for (int i = 0; i < opponentHands.size(); i++) {
      Hand opponentHand = opponentHands.get(i);
      Objects.requireNonNull(opponentHand, "opponentHand は必須です");

      // 勝敗判定
      Result result = judge(playerHand, opponentHand);

      // 集計
      switch (result) {
        case WIN -> win++;
        case LOSE -> lose++;
        case DRAW -> draw++;
      }

      // opponentIndex は 1 始まり（ユーザーに見せる番号のため）
      results.add(new RoundResult(i + 1, opponentHand, result));
    }

    // 集計結果をまとめてレスポンスに含める
    Summary summary = new Summary(win, lose, draw);

    return new RpsResponse(playerHand, opponentHands.size(), results, summary);
  }

  /**
   * 相手の手を人数分ランダムに生成する。
   *
   * <p>ThreadLocalRandom で乱数生成を行う（スレッドセーフかつ軽量）。
   *
   * @param opponents 相手人数
   * @return 手の一覧（サイズ=opponents）
   */
  private List<Hand> generateOpponentHands(int opponents) {
    List<Hand> hands = new ArrayList<>(opponents);
    Hand[] values = Hand.values();

    for (int i = 0; i < opponents; i++) {
      // values.length は 3（ROCK/PAPER/SCISSORS）
      int idx = ThreadLocalRandom.current().nextInt(values.length);
      hands.add(values[idx]);
    }

    return hands;
  }

  /**
   * じゃんけんの勝敗を判定する。
   *
   * @param playerHand 自分の手
   * @param opponentHand 相手の手
   * @return 勝敗（WIN/LOSE/DRAW）
   */
  Result judge(Hand playerHand, Hand opponentHand) {
    // 同手なら必ずあいこ（最優先で判定）
    if (playerHand == opponentHand) {
      return Result.DRAW;
    }

    // switch + 三項演算子で分岐（ここから先は自分の手ごとに勝てる相手の手が1つだけ決まる）
    return switch (playerHand) {
      case ROCK -> (opponentHand == Hand.SCISSORS) ? Result.WIN : Result.LOSE;
      case PAPER -> (opponentHand == Hand.ROCK) ? Result.WIN : Result.LOSE;
      case SCISSORS -> (opponentHand == Hand.PAPER) ? Result.WIN : Result.LOSE;
    };
  }
}

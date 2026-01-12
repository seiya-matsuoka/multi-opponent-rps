package com.github.seiyamatsuoka.multiopponentrps.rps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.github.seiyamatsuoka.multiopponentrps.rps.dto.RpsResponse;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Hand;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Result;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * RpsService の単体テスト。
 *
 * <p>ランダム生成に依存しないように、相手の手を固定して検証する。
 */
class RpsServiceTest {

  private final RpsService service = new RpsService();

  // 同じ手の場合は必ず DRAW になること
  @Test
  void judge_draw_whenSameHand() {
    assertEquals(Result.DRAW, service.judge(Hand.ROCK, Hand.ROCK));
    assertEquals(Result.DRAW, service.judge(Hand.PAPER, Hand.PAPER));
    assertEquals(Result.DRAW, service.judge(Hand.SCISSORS, Hand.SCISSORS));
  }

  // 勝ち/負けの対応関係が仕様通りであること
  @Test
  void judge_winLose_matrix() {
    assertEquals(Result.WIN, service.judge(Hand.ROCK, Hand.SCISSORS));
    assertEquals(Result.LOSE, service.judge(Hand.ROCK, Hand.PAPER));

    assertEquals(Result.WIN, service.judge(Hand.PAPER, Hand.ROCK));
    assertEquals(Result.LOSE, service.judge(Hand.PAPER, Hand.SCISSORS));

    assertEquals(Result.WIN, service.judge(Hand.SCISSORS, Hand.PAPER));
    assertEquals(Result.LOSE, service.judge(Hand.SCISSORS, Hand.ROCK));
  }

  // - 相手人数分の results が作られること
  // - opponentIndex が 1 始まりで連番になること
  // - summary の合計（win+lose+draw）が opponents と一致すること
  @Test
  void playWithOpponentHands_buildsResultsAndSummary() {
    List<Hand> opponentHands = List.of(Hand.SCISSORS, Hand.ROCK, Hand.PAPER);

    RpsResponse response = service.playWithOpponentHands(Hand.ROCK, opponentHands);

    assertNotNull(response);
    assertEquals(Hand.ROCK, response.playerHand());
    assertEquals(3, response.opponents());
    assertEquals(3, response.results().size());

    // opponentIndex が 1..N になっていること
    assertEquals(1, response.results().get(0).opponentIndex());
    assertEquals(2, response.results().get(1).opponentIndex());
    assertEquals(3, response.results().get(2).opponentIndex());

    // 結果自体も仕様通りであること（ROCK vs [SCISSORS, ROCK, PAPER]）
    assertEquals(Result.WIN, response.results().get(0).result());
    assertEquals(Result.DRAW, response.results().get(1).result());
    assertEquals(Result.LOSE, response.results().get(2).result());

    int total = response.summary().win() + response.summary().lose() + response.summary().draw();
    assertEquals(3, total);
  }

  // ランダム生成でも results の件数と opponents が一致すること（値の中身までは固定しない）
  @Test
  void play_generatesRequestedNumberOfOpponents() {
    RpsResponse response = service.play(Hand.PAPER, 10);

    assertNotNull(response);
    assertEquals(10, response.opponents());
    assertEquals(10, response.results().size());

    int total = response.summary().win() + response.summary().lose() + response.summary().draw();
    assertEquals(10, total);

    // 1件目と10件目の opponentIndex が 1 / 10 になっていること
    assertEquals(1, response.results().get(0).opponentIndex());
    assertEquals(10, response.results().get(9).opponentIndex());
  }
}

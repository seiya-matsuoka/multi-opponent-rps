package com.github.seiyamatsuoka.multiopponentrps.rps.model;

/**
 * 相手1人分の対戦結果。
 *
 * @param opponentIndex 相手番号（表示用の1始まり）
 * @param opponentHand 相手の手
 * @param result 勝敗
 */
public record RoundResult(int opponentIndex, Hand opponentHand, Result result) {}

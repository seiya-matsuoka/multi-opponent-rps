package com.github.seiyamatsuoka.multiopponentrps.rps.model;

/**
 * 勝敗の集計。
 *
 * @param win 勝ち数
 * @param lose 負け数
 * @param draw あいこ数
 */
public record Summary(int win, int lose, int draw) {}

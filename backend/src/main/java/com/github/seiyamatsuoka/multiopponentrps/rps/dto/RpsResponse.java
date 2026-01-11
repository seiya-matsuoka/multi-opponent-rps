package com.github.seiyamatsuoka.multiopponentrps.rps.dto;

import com.github.seiyamatsuoka.multiopponentrps.rps.model.Hand;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.RoundResult;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Summary;
import java.util.List;

/**
 * じゃんけんAPIのレスポンスDTO。
 *
 * @param playerHand 自分の手
 * @param opponents 対戦相手の人数
 * @param results 相手ごとの結果
 * @param summary 集計
 */
public record RpsResponse(
    Hand playerHand, int opponents, List<RoundResult> results, Summary summary) {}

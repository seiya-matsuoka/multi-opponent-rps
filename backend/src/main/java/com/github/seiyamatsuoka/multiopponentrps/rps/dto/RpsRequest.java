package com.github.seiyamatsuoka.multiopponentrps.rps.dto;

import com.github.seiyamatsuoka.multiopponentrps.rps.model.Hand;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * じゃんけんAPIのリクエストDTO。
 *
 * @param hand 自分の手（必須）
 * @param opponents 対戦相手の人数（1〜10）
 */
public record RpsRequest(
    @NotNull(message = "hand は必須です") Hand hand,
    @Min(value = 1, message = "opponents は 1 以上で指定してください")
        @Max(value = 10, message = "opponents は 10 以下で指定してください")
        int opponents) {}

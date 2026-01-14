package com.github.seiyamatsuoka.multiopponentrps.rps;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.github.seiyamatsuoka.multiopponentrps.rps.dto.RpsResponse;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Hand;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Result;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.RoundResult;
import com.github.seiyamatsuoka.multiopponentrps.rps.model.Summary;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * RpsController の単体テスト。
 *
 * <ul>
 *   <li>POST /api/rps が 200 を返すこと
 *   <li>レスポンスの主要フィールドがJSONとして返ること
 * </ul>
 *
 * <p>じゃんけんロジック自体は Service の単体テストで担保するため、ここではServiceをモックする。
 */
@WebMvcTest(controllers = RpsController.class)
class RpsControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private RpsService rpsService;

  // - ControllerがServiceを呼び、200でレスポンスを返すこと
  // - レスポンスの主要項目がJSONで返ること（詳細な勝敗ロジックはService側で担保）
  @Test
  void postRps_returnsResponse() throws Exception {
    RpsResponse stub =
        new RpsResponse(
            Hand.ROCK,
            2,
            List.of(
                new RoundResult(1, Hand.SCISSORS, Result.WIN),
                new RoundResult(2, Hand.ROCK, Result.DRAW)),
            new Summary(1, 0, 1));

    when(rpsService.play(any(Hand.class), anyInt())).thenReturn(stub);

    mockMvc
        .perform(
            post("/api/rps")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"hand\":\"ROCK\",\"opponents\":2}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.playerHand").value("ROCK"))
        .andExpect(jsonPath("$.opponents").value(2))
        .andExpect(jsonPath("$.results.length()").value(2))
        .andExpect(jsonPath("$.summary.win").value(1))
        .andExpect(jsonPath("$.summary.draw").value(1));
  }
}

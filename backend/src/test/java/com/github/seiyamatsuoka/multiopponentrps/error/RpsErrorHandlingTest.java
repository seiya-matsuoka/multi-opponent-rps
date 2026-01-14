package com.github.seiyamatsuoka.multiopponentrps.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.github.seiyamatsuoka.multiopponentrps.rps.RpsController;
import com.github.seiyamatsuoka.multiopponentrps.rps.RpsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * エラーハンドリングの単体テスト。
 *
 * <ul>
 *   <li>@Valid の失敗が統一JSONで返ること
 *   <li>enum不正などの JSON 変換失敗が統一JSONで返ること
 * </ul>
 */
@WebMvcTest(controllers = RpsController.class)
@Import(ApiExceptionHandler.class)
class RpsErrorHandlingTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private RpsService rpsService;

  // - hand が未指定（null）で @NotNull により 400 になること
  // - 返却JSONが ApiExceptionHandler の形式になっていること
  @Test
  void validationError_returnsUnified400() throws Exception {
    mockMvc
        .perform(
            post("/api/rps").contentType(MediaType.APPLICATION_JSON).content("{\"opponents\":2}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("入力が不正です"))
        .andExpect(jsonPath("$.details").isArray());
  }

  // - hand の enum 変換に失敗した場合に 400 になること
  // - 返却JSONが ApiExceptionHandler の形式になっていること
  @Test
  void invalidEnum_returnsUnified400() throws Exception {
    mockMvc
        .perform(
            post("/api/rps")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"hand\":\"INVALID\",\"opponents\":2}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("リクエストボディが不正です"))
        .andExpect(jsonPath("$.details").isArray());
  }
}

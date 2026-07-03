package com.guanxing.wenyi.dto.response;

import java.util.List;

public record ReportResponse(
        String id,
        String title,
        String meta,
        int readMinutes,
        List<SectionDTO> sections,
        String disclaimer
) {
    /** 正文段用 body（段落以 \n\n 分隔）；action 段用 items。 */
    public record SectionDTO(String key, String index, String title, String body, List<String> items) {
    }
}

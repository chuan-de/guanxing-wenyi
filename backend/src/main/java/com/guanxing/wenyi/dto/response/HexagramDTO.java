package com.guanxing.wenyi.dto.response;

import java.util.List;

/** 卦象：lines 由上到下，true=阳实线 / false=阴断线（与前端对齐）。 */
public record HexagramDTO(
        String name,
        String pinyin,
        String meaning,
        List<Boolean> lines
) {
}

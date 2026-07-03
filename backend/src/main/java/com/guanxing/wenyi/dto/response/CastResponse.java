package com.guanxing.wenyi.dto.response;

import java.util.List;

public record CastResponse(
        String id,
        String question,
        HexagramDTO hexagram,
        List<Integer> changingLines,
        HexagramDTO changingTo,
        String poem,
        long createdAt
) {
}

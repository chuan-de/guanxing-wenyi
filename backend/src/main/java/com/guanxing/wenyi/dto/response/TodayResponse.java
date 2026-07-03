package com.guanxing.wenyi.dto.response;

import java.util.List;

public record TodayResponse(
        String date,
        String astroHeadline,
        String moonNote,
        HexagramDTO hexagram,
        String hexagramNote,
        List<MoodTrackDayDTO> moodTrack,
        String moodSummary
) {
    /** 近 7 天每日一格；当日无记录时 mood/stress 为 null。 */
    public record MoodTrackDayDTO(String date, String label, String mood, Integer stress) {
    }
}

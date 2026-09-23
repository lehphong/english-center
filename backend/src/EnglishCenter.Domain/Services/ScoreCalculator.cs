using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Services;

public readonly record struct ScoreRange(decimal Min, decimal Max, decimal Step)
{
    public bool Contains(decimal score) => score >= Min && score <= Max && (score - Min) % Step == 0;
}

/// <summary>Quy tắc chấm điểm theo từng thang điểm.</summary>
public static class ScoreCalculator
{
    public static ScoreRange GetRange(GradingScheme scheme, Skill skill) => scheme switch
    {
        GradingScheme.Ielts => new ScoreRange(0, 9, 0.5m),
        GradingScheme.Toeic when skill is Skill.Listening or Skill.Reading => new ScoreRange(5, 495, 5),
        GradingScheme.Toeic => new ScoreRange(0, 200, 10),
        _ => new ScoreRange(0, 10, 0.1m)
    };

    /// <summary>
    /// Điểm tổng, hoặc null khi chưa đủ điểm:
    /// IELTS cần đủ 4 kỹ năng, TOEIC cần Nghe và Đọc, thang 10 cần ít nhất một kỹ năng.
    /// </summary>
    public static decimal? CalculateOverall(GradingScheme scheme, decimal? listening, decimal? reading, decimal? writing, decimal? speaking)
    {
        switch (scheme)
        {
            case GradingScheme.Toeic:
                return listening.HasValue && reading.HasValue ? listening + reading : null;

            case GradingScheme.Ielts:
                if (listening is not { } l || reading is not { } r || writing is not { } w || speaking is not { } s)
                {
                    return null;
                }
                return RoundIeltsBand((l + r + w + s) / 4);

            default:
                decimal?[] scores = [listening, reading, writing, speaking];
                var entered = scores.Where(x => x.HasValue).Select(x => x!.Value).ToList();
                return entered.Count == 0 ? null : Math.Round(entered.Average(), 1, MidpointRounding.AwayFromZero);
        }
    }

    /// <summary>Làm tròn band IELTS: phần lẻ .25 lên .5, .75 lên band kế tiếp.</summary>
    public static decimal RoundIeltsBand(decimal average)
    {
        var whole = Math.Floor(average);
        var fraction = average - whole;
        return fraction switch
        {
            < 0.25m => whole,
            < 0.75m => whole + 0.5m,
            _ => whole + 1
        };
    }
}

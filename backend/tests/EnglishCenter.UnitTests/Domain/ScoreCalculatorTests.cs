using EnglishCenter.Domain.Enums;
using EnglishCenter.Domain.Services;

namespace EnglishCenter.UnitTests.Domain;

public class ScoreCalculatorTests
{
    [Theory]
    [InlineData(6.0, 6.0, 6.0, 6.5, 6.0)]   // TB 6.125 -> 6.0
    [InlineData(6.0, 6.5, 6.5, 6.5, 6.5)]   // TB 6.375 -> 6.5
    [InlineData(5.0, 5.0, 5.5, 5.5, 5.5)]   // TB 5.25  -> 5.5
    [InlineData(6.5, 6.5, 7.0, 7.0, 7.0)]   // TB 6.75  -> 7.0
    [InlineData(9.0, 9.0, 9.0, 9.0, 9.0)]
    public void Ielts_RoundsAverageToIeltsBand(decimal l, decimal r, decimal w, decimal s, decimal expected) =>
        Assert.Equal(expected, ScoreCalculator.CalculateOverall(GradingScheme.Ielts, l, r, w, s));

    [Fact]
    public void Ielts_RequiresAllFourSkills() =>
        Assert.Null(ScoreCalculator.CalculateOverall(GradingScheme.Ielts, 7, 7, 7, null));

    [Fact]
    public void Toeic_OverallIsListeningPlusReading_IgnoringSpeakingAndWriting() =>
        Assert.Equal(785, ScoreCalculator.CalculateOverall(GradingScheme.Toeic, 400, 385, 150, 160));

    [Fact]
    public void Toeic_RequiresListeningAndReading() =>
        Assert.Null(ScoreCalculator.CalculateOverall(GradingScheme.Toeic, 400, null, 150, 160));

    [Fact]
    public void Standard_AveragesEnteredSkillsRoundedToOneDecimal() =>
        Assert.Equal(7.7m, ScoreCalculator.CalculateOverall(GradingScheme.Standard, 7, 8, 8, null));

    [Fact]
    public void Standard_WithoutScores_ReturnsNull() =>
        Assert.Null(ScoreCalculator.CalculateOverall(GradingScheme.Standard, null, null, null, null));

    [Theory]
    [InlineData(GradingScheme.Ielts, Skill.Listening, 6.5, true)]
    [InlineData(GradingScheme.Ielts, Skill.Listening, 6.3, false)]
    [InlineData(GradingScheme.Ielts, Skill.Speaking, 9.5, false)]
    [InlineData(GradingScheme.Toeic, Skill.Reading, 495, true)]
    [InlineData(GradingScheme.Toeic, Skill.Reading, 497, false)]
    [InlineData(GradingScheme.Toeic, Skill.Writing, 200, true)]
    [InlineData(GradingScheme.Toeic, Skill.Writing, 210, false)]
    [InlineData(GradingScheme.Standard, Skill.Writing, 8.7, true)]
    [InlineData(GradingScheme.Standard, Skill.Writing, 10.5, false)]
    public void GetRange_ValidatesScoresForScheme(GradingScheme scheme, Skill skill, decimal score, bool valid) =>
        Assert.Equal(valid, ScoreCalculator.GetRange(scheme, skill).Contains(score));
}

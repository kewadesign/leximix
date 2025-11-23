# Season Pass Rewards Template

Use this file to define new rewards for the Season Pass.

## Instructions
1.  Copy the block below for each new reward.
2.  Fill in the details.
3.  I will use this information to update `constants.ts` and `SEASON_REWARDS`.

## Reward Block

```markdown
### Level [NUMBER]
**Type**: [Coins | Avatar | Frame | Sticker | Booster | Mystery]
**Value/ID**: [Amount for coins, ID for others e.g., 'avatar_robot_1']
**Tier**: [Free | Premium]
**Description**: [Short description of what this is]
**Insertion Point**: `SEASON_REWARDS` array in `constants.ts`
```

## Example

### Level 5
**Type**: Coins
**Value/ID**: 500
**Tier**: Free
**Description**: Small coin pack for beginners.
**Insertion Point**: `SEASON_REWARDS` array in `constants.ts`

### Level 10
**Type**: Avatar
**Value/ID**: avatar_cyber_punk
**Tier**: Premium
**Description**: Exclusive Cyberpunk Avatar.
**Insertion Point**: `SEASON_REWARDS` array in `constants.ts`

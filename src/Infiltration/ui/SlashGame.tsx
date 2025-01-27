import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/helpers/keyCodes";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";

interface Difficulty {
  [key: string]: number;
  window: number;
}

const difficulties: {
  Trivial: Difficulty;
  Normal: Difficulty;
  Hard: Difficulty;
  Impossible: Difficulty;
} = {
  Trivial: { window: 800 },
  Normal: { window: 500 },
  Hard: { window: 350 },
  Impossible: { window: 250 },
};

export function SlashGame({ difficulty, onSuccess, onFailure }: IMinigameProps): React.ReactElement {
  const [phase, setPhase] = useState(0);
  const [hasAugment, setHasAugment] = useState(false);
  const [guardingTime, setGuardingTime] = useState(0);

  useEffect(() => {
    // Determine timeframes for game phase changes
    const newDifficulty: Difficulty = { window: 0 };
    interpolate(difficulties, difficulty, newDifficulty);
    const timePreparing =
      newDifficulty.window * (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.3 : 1);
    const timeAttacking = 250;
    const timeGuarding = Math.random() * 3250 + 1500 - (timeAttacking + timePreparing);

    // Set initial game state
    setPhase(0);
    setGuardingTime(timeGuarding);
    setHasAugment(Player.hasAugmentation(AugmentationName.MightOfAres, true));

    // Setup timer for game phases
    let id = setTimeout(() => {
      setPhase(1);
      id = setTimeout(() => {
        setPhase(2);
        id = setTimeout(() => onFailure(), timeAttacking);
      }, timePreparing);
    }, timeGuarding);

    return () => clearTimeout(id);
  }, [difficulty, onSuccess, onFailure]);

  function press(this: Document, event: KeyboardEvent): void {
    event.preventDefault();
    if (event.key !== KEY.SPACE) return;
    if (phase !== 1) {
      onFailure();
    } else {
      onSuccess();
    }
  }

  return (
    <>
      <GameTimer millis={5000} onExpire={onFailure} ignoreAugment_WKSharmonizer />
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4" textAlign="center">
          Attack after the guard drops his guard and is distracted. Do not alert him!
        </Typography>
        <br></br>
        {hasAugment && (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">The guard will drop his guard and be distracted in ...</Typography>
            <GameTimer millis={guardingTime} onExpire={() => null} ignoreAugment_WKSharmonizer noPaper tick={20} />
            <br></br>
          </Box>
        )}

        {phase === 0 && <Typography variant="h4">Guarding ...</Typography>}
        {phase === 1 && <Typography variant="h4">Distracted!</Typography>}
        {phase === 2 && <Typography variant="h4">Alerted!</Typography>}
        <KeyHandler onKeyDown={press} onFailure={onFailure} />
      </Paper>
    </>
  );
}

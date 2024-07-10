import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardMedia,
} from "@mui/material";

const BotCard = ({ bot, onToggle }) => {
  return (
    <Card elevation={3} className="p-4">
      <CardMedia
        component="img"
        height="200"
        // width="50px"
        image={bot.imgURL} // Assuming bot.imgURL is the field containing the image URL
        alt={bot.name}
        className="mb-2"
      />
      <CardContent>
        <Typography variant="h6" component="div">
          {bot.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Price: GHS{bot.price.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Potential Earnings: GHS {bot.potentialEarnings.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Operational Duration: {bot.operationalDuration} days
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onToggle}
          className="mt-4"
        >
          {bot.isRunning ? "Stop Bot" : "Active"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BotCard;

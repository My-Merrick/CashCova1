// MarketsTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const MarketsTable = ({ markets }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell align="right">24h Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {markets.map((market) => (
            <TableRow key={market.name}>
              <TableCell>{market.name}</TableCell>
              <TableCell>{market.price}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: market.change.startsWith("+")
                    ? "success.main"
                    : "error.main",
                }}
              >
                {market.change}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MarketsTable;

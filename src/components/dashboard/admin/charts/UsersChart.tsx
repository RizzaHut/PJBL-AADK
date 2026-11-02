"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export type UserMonthStat = {
  month: string;
  users: number;
};

export default function UsersChart({ data = [] }: { data?: UserMonthStat[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#EEF1F5" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#8B96A5" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8B96A5" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E7E9EC",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#EF542B"
            strokeWidth={2}
            dot={{ r: 3, fill: "#EF542B" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

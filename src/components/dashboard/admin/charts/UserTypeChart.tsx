"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export type UserTypeStat = {
  name: string;
  value: number;
};

const COLORS = ["#006FCD", "#EF542B"];

export default function UserTypeChart({
  data = [],
}: {
  data?: UserTypeStat[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const isEmpty = total <= 0;
  const chartData = isEmpty ? [{ name: "Belum ada data", value: 1 }] : data;

  return (
    <div className="flex h-[220px] w-full items-center justify-center gap-8">
      <div className="relative h-[180px] w-[180px] min-w-[180px] flex-shrink-0">
        <PieChart width={180} height={180}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={82}
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={isEmpty ? "#E5E7EB" : COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="space-y-3 text-sm">
        {chartData.map((item, index) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0;

          const label = isEmpty ? "Belum ada data" : item.name;
          const count = isEmpty ? 0 : item.value;

          return (
            <div key={item.name}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{
                    backgroundColor: isEmpty
                      ? "#E5E7EB"
                      : COLORS[index % COLORS.length],
                  }}
                />
                <span className="text-[#242424]">{label}</span>
              </div>
              <div className="ml-4.5 text-xs text-[#606060]">
                {count.toLocaleString("id-ID")} — {isEmpty ? 0 : percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

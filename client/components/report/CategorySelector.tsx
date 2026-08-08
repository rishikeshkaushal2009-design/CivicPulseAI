"use client";

import { useState } from "react";

const categories = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Drainage",
  "Water Supply",
  "Road Damage",
  "Traffic Signal",
  "Illegal Dumping",
];

export default function CategorySelector() {
  const [selected, setSelected] = useState("");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
      <h2 className="mb-6 text-2xl font-bold text-white">
        🏷 Select Category
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelected(category)}
            className={`rounded-xl border p-4 font-medium transition-all duration-300 ${
              selected === category
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-500 hover:bg-slate-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-6 rounded-xl border border-blue-700 bg-blue-950/30 p-4">
          <p className="text-blue-300">
            Selected Category:
            <span className="ml-2 font-semibold text-white">
              {selected}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
import React from "react";

export default function DashboardGrid({
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70
hover:border-blue-500 hover:shadow-xl
transition-all duration-300 cursor-pointer p-6">

    <div className="text-3xl mb-4">📚</div>

    <h3 className="text-xl font-semibold text-white">
        Browse Courses
    </h3>

    <p className="mt-2 text-slate-400">
        Core engineering, medical and programming courses.
    </p>

</div>
  );
}
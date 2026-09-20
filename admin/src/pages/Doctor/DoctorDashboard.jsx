import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ icon, iconBg, value, label }) => (
  <div className="flex items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex-1 min-w-[140px]">
    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <img src={icon} alt="" className="w-6 h-6 sm:w-7 sm:h-7" />
    </div>
    <div className="min-w-0">
      <p className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="flex items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 flex-1 min-w-[140px] animate-pulse">
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-200 flex-shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <div className="h-5 w-16 bg-gray-200 rounded" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Cancelled: "bg-red-50 text-red-600",
    Completed: "bg-green-50 text-green-600",
  };
  return (
    <span
      className={`text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const DoctorDashboard = () => {
  const {
    dashData,
    getDashData,
    dToken,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  // Loading skeleton instead of rendering nothing at all while dashData
  // is still being fetched — previously the whole page was blank until
  // the request resolved, which briefly looked broken on a slow connection.
  if (!dashData) {
    return (
      <div className="m-3 sm:m-5">
        <div className="flex flex-wrap gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="m-3 sm:m-5">
      <div className="flex flex-wrap gap-3">
        <StatCard
          icon={assets.earning_icon}
          iconBg="bg-blue-50"
          value={`${dashData.earnings} rs`}
          label="Fee Collected"
        />
        <StatCard
          icon={assets.appointments_icon}
          iconBg="bg-amber-50"
          value={dashData.appointments}
          label="Appointments"
        />
        <StatCard
          icon={assets.patients_icon}
          iconBg="bg-emerald-50"
          value={dashData.patients}
          label="Patients"
        />
      </div>

      {/* ANALYTICS: this doctor's own appointments + earnings trend over the last 8 weeks */}
      {dashData.weeklyTrends && (
        <div className="bg-white mt-5 sm:mt-6 rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <p className="font-semibold text-gray-800 text-sm sm:text-base mb-4">
            Your Appointments & Earnings — Last 8 Weeks
          </p>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dashData.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Appointments",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Earnings (rs)",
                    angle: 90,
                    position: "insideRight",
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="appointments"
                  name="Appointments"
                  fill="#93c5fd"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings (rs)"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Latest Bookings */}
      <div className="bg-white mt-5 sm:mt-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
          <img src={assets.list_icon} alt="" className="w-5 sm:w-auto" />
          <p className="font-semibold text-gray-800 text-sm sm:text-base">
            Latest Bookings
          </p>
        </div>

        {dashData.latestAppointments?.length > 0 ? (
          dashData.latestAppointments.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 border-t border-gray-100 hover:bg-gray-50/70 transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.userData.image}
                  alt=""
                  className="rounded-full w-9 h-9 sm:w-10 sm:h-10 object-cover flex-shrink-0 ring-1 ring-gray-100"
                />
                <div className="text-xs sm:text-sm min-w-0">
                  <p className="text-gray-800 font-medium truncate">
                    {item.userData.name}
                  </p>
                  <p className="text-gray-400 truncate">{item.slotDate}</p>
                </div>
              </div>
              {item.cancelled ? (
                <StatusBadge status="Cancelled" />
              ) : item.isCompleted ? (
                <StatusBadge status="Completed" />
              ) : (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => cancelAppointment(item._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    aria-label={`Cancel appointment with ${item.userData.name}`}
                  >
                    <img
                      src={assets.cancel_icon}
                      alt=""
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      completeAppointment(item._id);
                      getDashData();
                    }}
                    className="p-1.5 rounded-lg hover:bg-green-50 transition-all cursor-pointer"
                    aria-label={`Approve appointment with ${item.userData.name}`}
                  >
                    <img
                      src={assets.tick_icon}
                      alt=""
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm py-8">
            No recent bookings
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
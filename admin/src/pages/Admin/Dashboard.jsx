import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
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

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  if (!dashData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 w-full">
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen w-full">
      {/* --- TOP STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Doctors Card */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-default">
          <div className="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-full flex-shrink-0">
            <img
              src={assets.doctor_icon}
              alt="Doctors"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashData.doctors}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Total Doctors
            </p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-default">
          <div className="w-14 h-14 flex items-center justify-center bg-green-50 rounded-full flex-shrink-0">
            <img
              src={assets.appointments_icon}
              alt="Appointments"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashData.appointments}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Appointments
            </p>
          </div>
        </div>

        {/* Patients Card */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-default">
          <div className="w-14 h-14 flex items-center justify-center bg-purple-50 rounded-full flex-shrink-0">
            <img
              src={assets.patients_icon}
              alt="Patients"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashData.patients}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Total Patients
            </p>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: CHARTS & BOOKINGS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ANALYTICS CHART (Takes 2 columns on large screens) */}
        {dashData.weeklyTrends && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Appointments & Revenue
              </h2>
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                Last 8 Weeks
              </span>
            </div>

            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dashData.weeklyTrends}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="appointments"
                    name="Appointments"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (rs)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LATEST BOOKINGS (Takes 1 column on large screens) */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
            <img
              src={assets.list_icon}
              alt="list"
              className="w-5 h-5 opacity-70"
            />
            <h2 className="text-lg font-bold text-gray-800">Latest Bookings</h2>
          </div>

          {/* Scrollable List Container */}
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
            {dashData.latestAppointments?.length > 0 ? (
              dashData.latestAppointments.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.docData.image}
                      alt="Doctor"
                      className="rounded-full w-10 h-10 object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {item.docData.name}
                      </p>
                      <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                        {item.slotDate}
                      </p>
                    </div>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex-shrink-0 flex items-center">
                    {item.cancelled ? (
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cancelAppointment(item._id)}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors group"
                        title="Cancel Appointment"
                      >
                        <img
                          src={assets.cancel_icon}
                          alt="Cancel"
                          className="w-6 h-6 group-hover:scale-110 transition-transform"
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-sm font-medium">No recent bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

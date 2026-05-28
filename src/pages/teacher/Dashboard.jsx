import { Card, Col, Row, Table, Tag } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { getDashboard } from "../../api/api";
import { mockStats, mockBarData, mockPieData } from "../../mock/dashboardMock";
function Dashboard() {

  const [stats, setStats] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();

      setStats(res.stats || []);
      setBarData(res.barData || []);
      setPieData(res.pieData || []);
      setSessions(res.sessions || []);

    } catch (error) {
      console.log("Không gọi được API, dùng data fallback");

      setStats(mockStats);
      setBarData(mockBarData);
      setPieData(mockPieData);
    }
  };

  const columns = [
    {
      title: "Tên kỳ thi",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          draft: "default",
          published: "blue",
          ongoing: "green",
          finished: "red"
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    }
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="dashboard-container">

      {/* TOP STATS */}
      <Row gutter={20}>
        {stats.map((item, index) => (
          <Col span={6} key={index}>
            <Card className="stats-card">
              <p className="stats-title">
                {item.title}
              </p>

              <h2 className="stats-value">
                {item.value}
              </h2>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHART SECTION */}
      <Row
        gutter={20}
        className="chart-section"
      >
        {/* LEFT */}
        <Col span={16}>
          <Card className="chart-card">
            <div className="chart-header">
              <div>
                <h3>
                  Số bài nộp theo tháng
                </h3>
                <p>
                  Thống kê hoạt động học tập
                </p>
              </div>
            </div>

            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="submissions"
                  fill="#f7a400"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* RIGHT */}
        <Col span={8}>
          <Card className="pie-card">
            <h3>
              Phân bố kết quả
            </h3>

            <p>
              Tổng quan học lực
            </p>

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={95}
                >
                  {pieData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="legend-box">
              {pieData.map(
                (item, i) => (
                  <div
                    key={i}
                    className="legend-item"
                  >
                    <span>
                      {
                        item.name
                      }
                    </span>

                    <b>
                      {
                        item.value
                      }
                      %
                    </b>
                  </div>
                )
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* PREMIUM CARD */}
      <Row
        className="premium-row"
      >
        <Col span={24}>
          <Card className="premium-card">
            <h3>
              EduPulse Premium
            </h3>

            <p>
              Mở khóa tính
              năng AI,
              báo cáo nâng
              cao và kho
              tài liệu
              không giới
              hạn.
            </p>

            <button>
              Nâng cấp ngay
            </button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
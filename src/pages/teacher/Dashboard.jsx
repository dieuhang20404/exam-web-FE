import { Card, Col, Row, Progress, List } from "antd";
import "./Dashboard.css";

function Dashboard() {

  const stats = [
    { title: "Lớp học", value: 5 },
    { title: "Đề thi", value: 12 },
    { title: "Sinh viên", value: 120 },
    { title: "Bài đã nộp", value: 98 }
  ];

  const recentActivities = [
    "Sinh viên A vừa nộp bài",
    "Tạo đề thi Java",
    "Cập nhật câu hỏi SQL",
    "Sinh viên B bắt đầu làm bài"
  ];

  {/*const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/dashboard");
      
      setStats([
        { title: "Lớp học", value: res.data.totalClasses },
        { title: "Đề thi", value: res.data.totalExams },
        { title: "Sinh viên", value: res.data.totalStudents },
        { title: "Bài đã nộp", value: res.data.totalSubmissions }
      ]);

    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <p>Loading...</p>;*/}

  return (
    <div className="dashboard-container">

      <Row gutter={16}>
        {stats.map((item, index) => (
          <Col span={6} key={index}>
            <Card className="dashboard-card" title={item.title}>
              <h2>{item.value}</h2>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} className="dashboard-section">

        {/* Progress */}
        <Col span={12}>
          <Card title="Tỷ lệ hoàn thành">
            <Progress percent={75} />
            <Progress percent={50} status="active" />
            <Progress percent={90} />
          </Card>
        </Col>

        {/* Activity */}
        <Col span={12}>
          <Card title="Hoạt động gần đây">
            <List
              dataSource={recentActivities}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>

      </Row>

    </div>
  );
}

export default Dashboard;
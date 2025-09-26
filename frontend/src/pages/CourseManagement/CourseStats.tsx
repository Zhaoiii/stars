import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Progress, Spin, message } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { CourseStats as CourseStatsType } from "../../types/course";
import { courseService } from "../../services/courseService";
import "./CourseStats.css";

const CourseStats: React.FC = () => {
  const [stats, setStats] = useState<CourseStatsType | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseStats();
      setStats(data);
    } catch (error) {
      message.error("加载统计数据失败");
      console.error("加载统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="course-stats-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // 计算完成率
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // 计算进行率
  const progressRate =
    stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0;

  return (
    <div className="course-stats">
      <Row gutter={[16, 16]}>
        {/* 总课程数 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="总课程数"
              value={stats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        {/* 已完成课程 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        {/* 进行中课程 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="进行中"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        {/* 已取消课程 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="已取消"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>

        {/* 完成率 */}
        <Col xs={24} sm={12} lg={12}>
          <Card className="stats-card">
            <div className="progress-section">
              <div className="progress-header">
                <BarChartOutlined className="progress-icon" />
                <span className="progress-title">课程完成率</span>
              </div>
              <Progress
                percent={completionRate}
                strokeColor="#52c41a"
                trailColor="#f0f0f0"
                size={[100, 10]}
                format={(percent) => `${percent}%`}
              />
              <div className="progress-text">
                已完成 {stats.completed} / {stats.total} 个课程
              </div>
            </div>
          </Card>
        </Col>

        {/* 进行率 */}
        <Col xs={24} sm={12} lg={12}>
          <Card className="stats-card">
            <div className="progress-section">
              <div className="progress-header">
                <ClockCircleOutlined className="progress-icon" />
                <span className="progress-title">课程进行率</span>
              </div>
              <Progress
                percent={progressRate}
                strokeColor="#faad14"
                trailColor="#f0f0f0"
                size={[100, 10]}
                format={(percent) => `${percent}%`}
              />
              <div className="progress-text">
                进行中 {stats.inProgress} / {stats.total} 个课程
              </div>
            </div>
          </Card>
        </Col>

        {/* 课程类型分布 */}
        <Col xs={24} lg={12}>
          <Card className="stats-card" title="课程类型分布">
            <div className="type-distribution">
              <div className="type-item">
                <div className="type-info">
                  <div className="type-label">评估课程</div>
                  <div className="type-value">{stats.byType.evaluation}</div>
                </div>
                <div className="type-bar">
                  <div
                    className="type-fill evaluation"
                    style={{
                      width:
                        stats.total > 0
                          ? `${(stats.byType.evaluation / stats.total) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="type-item">
                <div className="type-info">
                  <div className="type-label">个训课程</div>
                  <div className="type-value">
                    {stats.byType.individual_training}
                  </div>
                </div>
                <div className="type-bar">
                  <div
                    className="type-fill individual-training"
                    style={{
                      width:
                        stats.total > 0
                          ? `${
                              (stats.byType.individual_training / stats.total) *
                              100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 课程状态分布 */}
        <Col xs={24} lg={12}>
          <Card className="stats-card" title="课程状态分布">
            <div className="status-distribution">
              <div className="status-item">
                <div className="status-dot scheduled" />
                <div className="status-info">
                  <div className="status-label">已安排</div>
                  <div className="status-value">{stats.scheduled}</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-dot in-progress" />
                <div className="status-info">
                  <div className="status-label">进行中</div>
                  <div className="status-value">{stats.inProgress}</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-dot completed" />
                <div className="status-info">
                  <div className="status-label">已完成</div>
                  <div className="status-value">{stats.completed}</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-dot cancelled" />
                <div className="status-info">
                  <div className="status-label">已取消</div>
                  <div className="status-value">{stats.cancelled}</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseStats;

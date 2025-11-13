import React, { useState } from 'react';
import { Form, Input, Button, Slider, DatePicker, Switch, TimePicker, Space } from 'antd';
import { ColorPicker } from 'antd';
import { BiSolidReport } from 'react-icons/bi';

function Reports() {
  const [color, setColor] = useState('#1677ff');

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  const onFinish = (values) => {
    console.log('Config values:', values);
  };

  return (
    <div>
      <div className="page-title-section">
        <h1><BiSolidReport size={24} className="page-title-icon-custom" /> Reports</h1>
      </div>
      <div className="page-content">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item name="color" label="Color Picker">
            <ColorPicker
              value={color}
              onChange={handleColorChange}
              addonAfter={<div className="color-preview" style={{ backgroundColor: color }} />}
            />
        </Form.Item>
        <Form.Item name="notificationLevel" label="Notification Level">
          <Slider min={0} max={100} />
        </Form.Item>
        <Form.Item name="date" label="Select Date">
          <DatePicker />
        </Form.Item>
        <Form.Item name="switch" label="Enable Feature">
          <Switch />
        </Form.Item>
        <Form.Item name="time" label="Select Time">
          <TimePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Config
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
  );
}

export default Reports;
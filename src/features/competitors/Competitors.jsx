import React from 'react';
import { Table } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

function Competitors() {
  const dataSource = [
    { key: '1', name: 'Alice', age: 25, address: 'Paris' },
    { key: '2', name: 'Bob', age: 30, address: 'Berlin' },
    // ...more data...
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
  ];

  return (
    <div>
      <div className="page-title-section">
        <h1><TeamOutlined className="page-title-icon" /> Competitors</h1>
      </div>
      <div className="page-content">
        <Table dataSource={dataSource} columns={columns} />
      </div>
    </div>
  );
}

export default Competitors;
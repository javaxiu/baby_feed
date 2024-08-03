import express from 'express';
const app = express();
const port = 9000;

// 用于解析 application/json 格式的请求体
app.use(express.json());

// 用于解析 application/x-www-form-urlencoded 格式的请求体
app.use(express.urlencoded({ extended: true }));

// 处理 POST 请求
app.post('/api/data', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.send('上传好啦');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
# 阿里云部署指南

## 方案对比

### 方案一：ECS + PM2（推荐新手）

**优点**：简单直接，成本可控
**缺点**：需要手动配置服务器
**适合**：中小型项目，预算有限

### 方案二：容器服务 ACK（推荐生产环境）

**优点**：自动扩缩容，高可用
**缺点**：成本较高，配置复杂
**适合**：大型项目，需要高可用

### 方案三：Serverless（最简单）

**优点**：按需付费，无需管理服务器
**缺点**：冷启动问题
**适合**：流量不稳定的项目

---

## 方案一：ECS + PM2 部署（详细步骤）

### 1. 购买阿里云资源

#### 1.1 购买 ECS 服务器

```
配置建议：
- CPU: 2核
- 内存: 4GB
- 系统盘: 40GB
- 操作系统: Ubuntu 22.04 LTS 或 CentOS 8
- 带宽: 5Mbps
```

#### 1.2 购买 RDS MySQL 数据库

```
配置建议：
- 版本: MySQL 8.0
- 规格: 2核4GB
- 存储: 20GB SSD
```

### 2. 配置服务器环境

#### 2.1 连接到服务器

```bash
ssh root@your_server_ip
```

#### 2.2 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # 验证安装
```

#### 2.3 安装 pnpm

```bash
npm install -g pnpm
pnpm -v  # 验证安装
```

#### 2.4 安装 PM2

```bash
npm install -g pm2
pm2 -v  # 验证安装
```

#### 2.5 安装 Git

```bash
# Ubuntu
apt update
apt install git -y

# CentOS
yum install git -y
```

### 3. 部署应用

#### 3.1 克隆代码

```bash
cd /var/www
git clone your_repository_url cost-manage-serve
cd cost-manage-serve
```

#### 3.2 安装依赖

```bash
pnpm install
```

#### 3.3 配置环境变量

```bash
# 创建生产环境配置文件
cp .env .env.production

# 编辑配置文件
nano .env.production
```

配置内容：

```env
# 数据库配置（使用阿里云 RDS）
DATABASE_URL="mysql://username:password@rds_host:3306/cost_management"

# 应用配置
NODE_ENV=production
PORT=3000

# JWT 配置
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# 其他配置...
```

#### 3.4 生成 Prisma Client

```bash
npx prisma generate
```

#### 3.5 同步数据库

```bash
npx prisma db push
```

#### 3.6 构建应用

```bash
pnpm run build
```

#### 3.7 使用 PM2 启动应用

```bash
# 创建 PM2 配置文件
nano ecosystem.config.js
```

PM2 配置文件内容：

```javascript
module.exports = {
  apps: [
    {
      name: 'cost-manage-api',
      script: './dist/main.js',
      instances: 2, // 启动2个实例
      exec_mode: 'cluster', // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

启动应用：

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 查看应用状态
pm2 status

# 查看日志
pm2 logs cost-manage-api

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 配置 Nginx 反向代理

#### 4.1 安装 Nginx

```bash
# Ubuntu
apt install nginx -y

# CentOS
yum install nginx -y
```

#### 4.2 配置 Nginx

```bash
nano /etc/nginx/sites-available/cost-manage-api
```

Nginx 配置内容：

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名

    # 日志配置
    access_log /var/log/nginx/cost-manage-api.access.log;
    error_log /var/log/nginx/cost-manage-api.error.log;

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传大小限制
    client_max_body_size 50M;
}
```

#### 4.3 启用配置并重启 Nginx

```bash
# Ubuntu
ln -s /etc/nginx/sites-available/cost-manage-api /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl restart nginx

# CentOS
nginx -t
systemctl restart nginx
```

### 5. 配置 SSL 证书（可选但推荐）

#### 5.1 安装 Certbot

```bash
# Ubuntu
apt install certbot python3-certbot-nginx -y

# CentOS
yum install certbot python3-certbot-nginx -y
```

#### 5.2 获取证书

```bash
certbot --nginx -d your_domain.com
```

### 6. 配置防火墙

```bash
# 开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 7. 设置自动部署脚本

创建部署脚本：

```bash
nano /var/www/cost-manage-serve/deploy.sh
```

脚本内容：

```bash
#!/bin/bash

echo "开始部署..."

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install

# 生成 Prisma Client
npx prisma generate

# 同步数据库
npx prisma db push

# 构建应用
pnpm run build

# 重启 PM2
pm2 restart cost-manage-api

echo "部署完成！"
```

赋予执行权限：

```bash
chmod +x deploy.sh
```

使用：

```bash
./deploy.sh
```

---

## 方案二：Docker + 阿里云容器服务

### 1. 创建 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN pnpm run build

# 生产镜像
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: always
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=cost_management
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: always

volumes:
  mysql_data:
```

### 3. 推送到阿里云容器镜像服务

```bash
# 登录阿里云容器镜像服务
docker login --username=your_username registry.cn-hangzhou.aliyuncs.com

# 构建镜像
docker build -t cost-manage-api:latest .

# 打标签
docker tag cost-manage-api:latest registry.cn-hangzhou.aliyuncs.com/your_namespace/cost-manage-api:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your_namespace/cost-manage-api:latest
```

---

## 常用运维命令

### PM2 命令

```bash
pm2 list                    # 查看所有应用
pm2 logs cost-manage-api    # 查看日志
pm2 restart cost-manage-api # 重启应用
pm2 stop cost-manage-api    # 停止应用
pm2 delete cost-manage-api  # 删除应用
pm2 monit                   # 监控应用
```

### 数据库备份

```bash
# 备份数据库
mysqldump -h rds_host -u username -p cost_management > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -h rds_host -u username -p cost_management < backup_20240101.sql
```

### 日志查看

```bash
# 查看 Nginx 日志
tail -f /var/log/nginx/cost-manage-api.access.log
tail -f /var/log/nginx/cost-manage-api.error.log

# 查看应用日志
pm2 logs cost-manage-api --lines 100
```

---

## 监控和告警

### 1. 使用阿里云云监控

- 配置 ECS 监控
- 配置 RDS 监控
- 设置告警规则（CPU、内存、磁盘使用率）

### 2. 使用 PM2 Plus（可选）

```bash
pm2 link your_secret_key your_public_key
```

---

## 安全建议

1. **定期更新系统和依赖**
2. **使用强密码**
3. **配置防火墙规则**
4. **启用 HTTPS**
5. **定期备份数据库**
6. **配置日志轮转**
7. **限制 SSH 登录（使用密钥认证）**
8. **配置安全组规则**

---

## 成本估算（按月）

### 基础配置

- ECS (2核4GB): ¥100-200
- RDS MySQL (2核4GB): ¥200-300
- 带宽 (5Mbps): ¥50-100
- **总计**: ¥350-600/月

### 优化建议

- 使用包年包月享受折扣
- 使用预留实例节省成本
- 合理配置带宽（按需调整）

---

## 故障排查

### 应用无法启动

```bash
# 查看 PM2 日志
pm2 logs cost-manage-api

# 检查端口占用
netstat -tlnp | grep 3000

# 检查数据库连接
npx prisma db pull
```

### 数据库连接失败

```bash
# 测试数据库连接
mysql -h rds_host -u username -p

# 检查白名单配置
# 在阿里云 RDS 控制台添加 ECS 内网 IP
```

### Nginx 502 错误

```bash
# 检查应用是否运行
pm2 status

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

---

需要我详细说明某个具体步骤吗？

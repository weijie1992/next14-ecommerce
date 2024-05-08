import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import db from '@/db/db';
import { formatCurrency, formatNumber } from '@/lib/formatters';

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);
  const averageValuePerUser =
    userCount === 0
      ? 0
      : (orderData._sum.pricePaidInCents || 0) / userCount / 100;
  return { userCount, averageValuePerUser };
}

export default async function AdminDashboard() {
  const [saleData, userData] = await Promise.all([
    getSalesData(),
    getUserData(),
  ]);
  return (
    <div className="grid grid-cols-1 md:grid-cols2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(saleData.numberOfSales)} Orders`}
        body={formatCurrency(saleData.amount)}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(
          userData.averageValuePerUser,
        )} Average Value`}
        body={formatNumber(userData.userCount)}
      />
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}

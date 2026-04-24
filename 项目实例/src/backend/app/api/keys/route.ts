// 获取密钥列表
import { NextRequest, NextResponse } from 'next/server';
import { getKeys } from '../../lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const { keys, total } = getKeys(page, pageSize);

    // 转换日期为 ISO 字符串
    const formattedKeys = keys.map(key => ({
      ...key,
      createdAt: key.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      keys: formattedKeys,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Get keys error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
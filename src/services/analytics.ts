import { supabase, bookingHistoryService as supabaseBookingHistoryService, hostelService as supabaseHostelService } from './supabase';
import type { AnalyticsData, BookingHistoryEntry } from '../types/hostel';
import type { BookingHistoryRow } from '../types/database';

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
}

export interface HostelPerformanceMetrics {
  hostelId: string;
  hostelName: string;
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
  averageViewsPerDay: number;
  averageContactsPerDay: number;
  ranking: number;
  engagementScore: number;
  trendData: {
    date: string;
    views: number;
    contacts: number;
  }[];
}

export interface AnalyticsComparison {
  current: HostelPerformanceMetrics;
  previous: HostelPerformanceMetrics;
  growth: {
    views: number;
    contacts: number;
    conversionRate: number;
  };
}

export interface AnalyticsSummary {
  totalHostels: number;
  totalViews: number;
  totalContacts: number;
  averageConversionRate: number;
  topPerformingHostel: HostelPerformanceMetrics | null;
  worstPerformingHostel: HostelPerformanceMetrics | null;
}

/**
 * Analytics service for aggregating and calculating hostel performance data
 */
export class AnalyticsService {
  /**
   * Get comprehensive analytics data for all hostels owned by a landlord
   */
  async getLandlordAnalytics(
    landlordId: string,
    timeRange?: AnalyticsTimeRange
  ): Promise<AnalyticsData[]> {
    try {
      // Get all hostels for the landlord
      const hostels = await supabaseHostelService.getHostelsByLandlord(landlordId);
      
      if (hostels.length === 0) {
        return [];
      }

      // Get analytics data for all hostels
      const analyticsPromises = hostels.map(async (hostel) => {
        const metrics = await this.getHostelPerformanceMetrics(
          hostel.id,
          timeRange
        );
        
        return {
          hostelId: hostel.id,
          hostelName: hostel.name,
          totalViews: metrics.totalViews,
          totalContacts: metrics.totalContacts,
          conversionRate: metrics.conversionRate,
          ranking: 0, // Will be calculated after all data is collected
          trendData: metrics.trendData,
        };
      });
      
      const analytics = await Promise.all(analyticsPromises);
      
      // Calculate rankings based on engagement score
      return this.calculateRankings(analytics);
    } catch (error) {
      console.error('Error getting landlord analytics:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Get detailed performance metrics for a specific hostel
   */
  async getHostelPerformanceMetrics(
    hostelId: string,
    timeRange?: AnalyticsTimeRange
  ): Promise<HostelPerformanceMetrics> {
    try {
      // Get booking history for the hostel
      const history = await this.getHostelBookingHistory(hostelId, timeRange);
      
      // Calculate basic metrics
      const views = history.filter(h => h.action === 'viewed').length;
      const contacts = history.filter(h => h.action === 'contacted').length;
      const conversionRate = views > 0 ? (contacts / views) * 100 : 0;
      
      // Calculate time-based averages
      const daysDiff = timeRange 
        ? Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24))
        : 30; // Default to 30 days
      
      const averageViewsPerDay = daysDiff > 0 ? views / daysDiff : 0;
      const averageContactsPerDay = daysDiff > 0 ? contacts / daysDiff : 0;
      
      // Generate trend data
      const trendData = this.generateTrendData(history, timeRange);
      
      // Calculate engagement score (views + contacts * 2)
      const engagementScore = views + (contacts * 2);
      
      // Get hostel name
      const hostel = await supabaseHostelService.getHostelById(hostelId);
      const hostelName = hostel?.name || 'Unknown Hostel';
      
      return {
        hostelId,
        hostelName,
        totalViews: views,
        totalContacts: contacts,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageViewsPerDay: Math.round(averageViewsPerDay * 100) / 100,
        averageContactsPerDay: Math.round(averageContactsPerDay * 100) / 100,
        ranking: 0, // Will be set by caller
        engagementScore,
        trendData,
      };
    } catch (error) {
      console.error('Error getting hostel performance metrics:', error);
      throw new Error('Failed to fetch hostel performance metrics');
    }
  }

  /**
   * Get booking history for a specific hostel within a time range
   */
  private async getHostelBookingHistory(
    hostelId: string,
    timeRange?: AnalyticsTimeRange
  ): Promise<BookingHistoryRow[]> {
    let query = supabase
      .from('booking_history')
      .select('*')
      .eq('hostel_id', hostelId)
      .order('timestamp', { ascending: false });

    if (timeRange) {
      query = query
        .gte('timestamp', timeRange.start.toISOString())
        .lte('timestamp', timeRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching hostel booking history:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Generate trend data for analytics visualization
   */
  private generateTrendData(
    history: BookingHistoryRow[],
    timeRange?: AnalyticsTimeRange
  ): AnalyticsData['trendData'] {
    const endDate = timeRange?.end || new Date();
    const startDate = timeRange?.start || new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // Default 7 days
    
    const days: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days.map(date => {
      const dayHistory = history.filter(h => 
        h.timestamp.split('T')[0] === date
      );
      
      return {
        date,
        views: dayHistory.filter(h => h.action === 'viewed').length,
        contacts: dayHistory.filter(h => h.action === 'contacted').length,
      };
    });
  }

  /**
   * Calculate rankings for analytics data based on engagement score
   */
  private calculateRankings(analytics: Omit<AnalyticsData, 'ranking'>[]): AnalyticsData[] {
    return analytics
      .map(a => ({
        ...a,
        engagementScore: a.totalViews + (a.totalContacts * 2),
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .map((a, index) => ({
        hostelId: a.hostelId,
        hostelName: a.hostelName,
        totalViews: a.totalViews,
        totalContacts: a.totalContacts,
        conversionRate: a.conversionRate,
        ranking: index + 1,
        trendData: a.trendData,
      }));
  }

  /**
   * Compare hostel performance between two time periods
   */
  async compareHostelPerformance(
    hostelId: string,
    currentPeriod: AnalyticsTimeRange,
    previousPeriod: AnalyticsTimeRange
  ): Promise<AnalyticsComparison> {
    try {
      const [current, previous] = await Promise.all([
        this.getHostelPerformanceMetrics(hostelId, currentPeriod),
        this.getHostelPerformanceMetrics(hostelId, previousPeriod),
      ]);

      const growth = {
        views: previous.totalViews > 0 
          ? ((current.totalViews - previous.totalViews) / previous.totalViews) * 100 
          : current.totalViews > 0 ? 100 : 0,
        contacts: previous.totalContacts > 0 
          ? ((current.totalContacts - previous.totalContacts) / previous.totalContacts) * 100 
          : current.totalContacts > 0 ? 100 : 0,
        conversionRate: current.conversionRate - previous.conversionRate,
      };

      return {
        current,
        previous,
        growth: {
          views: Math.round(growth.views * 100) / 100,
          contacts: Math.round(growth.contacts * 100) / 100,
          conversionRate: Math.round(growth.conversionRate * 100) / 100,
        },
      };
    } catch (error) {
      console.error('Error comparing hostel performance:', error);
      throw new Error('Failed to compare hostel performance');
    }
  }

  /**
   * Get analytics summary for all hostels owned by a landlord
   */
  async getAnalyticsSummary(
    landlordId: string,
    timeRange?: AnalyticsTimeRange
  ): Promise<AnalyticsSummary> {
    try {
      const analytics = await this.getLandlordAnalytics(landlordId, timeRange);
      
      if (analytics.length === 0) {
        return {
          totalHostels: 0,
          totalViews: 0,
          totalContacts: 0,
          averageConversionRate: 0,
          topPerformingHostel: null,
          worstPerformingHostel: null,
        };
      }

      const totalViews = analytics.reduce((sum, a) => sum + a.totalViews, 0);
      const totalContacts = analytics.reduce((sum, a) => sum + a.totalContacts, 0);
      const averageConversionRate = analytics.reduce((sum, a) => sum + a.conversionRate, 0) / analytics.length;

      // Get detailed metrics for top and worst performing hostels
      const topHostelData = analytics[0]; // Already sorted by ranking
      const worstHostelData = analytics[analytics.length - 1];

      const [topPerformingHostel, worstPerformingHostel] = await Promise.all([
        this.getHostelPerformanceMetrics(topHostelData.hostelId, timeRange),
        this.getHostelPerformanceMetrics(worstHostelData.hostelId, timeRange),
      ]);

      topPerformingHostel.ranking = 1;
      worstPerformingHostel.ranking = analytics.length;

      return {
        totalHostels: analytics.length,
        totalViews,
        totalContacts,
        averageConversionRate: Math.round(averageConversionRate * 100) / 100,
        topPerformingHostel,
        worstPerformingHostel: analytics.length > 1 ? worstPerformingHostel : null,
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      throw new Error('Failed to fetch analytics summary');
    }
  }

  /**
   * Get time range presets for analytics filtering
   */
  static getTimeRangePresets(): Record<string, AnalyticsTimeRange> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      today: {
        start: today,
        end: now,
      },
      week: {
        start: new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)),
        end: now,
      },
      month: {
        start: new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)),
        end: now,
      },
      quarter: {
        start: new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)),
        end: now,
      },
      year: {
        start: new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000)),
        end: now,
      },
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

export default analyticsService;
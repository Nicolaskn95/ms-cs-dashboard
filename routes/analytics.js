    const express = require('express');
    const donationService = require('../services/donationService');

    const router = express.Router();

    // GET /api/analytics/overview - Get comprehensive analytics overview
    router.get('/overview', (req, res) => {
    try {
        const analytics = donationService.getDonationsAnalytics();
        res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics overview',
        message: error.message
        });
    }
    });

    // GET /api/analytics/charts/:chartType - Get chart-specific data
    router.get('/charts/:chartType', (req, res) => {
    try {
        const { chartType } = req.params;
        const validChartTypes = [
        'category-pie',
        'usage-bar', 
        'monthly-line',
        'gender-pie',
        'overview'
        ];

        if (!validChartTypes.includes(chartType)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid chart type',
            validChartTypes,
            provided: chartType
        });
        }

        const chartData = donationService.getChartData(chartType);
        
        res.json({
        success: true,
        chartType,
        data: chartData,
        timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        error: 'Failed to fetch chart data',
        message: error.message
        });
    }
    });

    // GET /api/analytics/trends - Get donations over time trends
    router.get('/trends', (req, res) => {
    try {
        const trends = donationService.getDonationsOverTime();
        
        const growthData = trends.map((month, index) => {
        const previousMonth = index > 0 ? trends[index - 1] : null;
        const growth = previousMonth 
            ? month.totalQuantity - previousMonth.totalQuantity
            : 0;
        const growthPercentage = previousMonth && previousMonth.totalQuantity > 0
            ? Math.round((growth / previousMonth.totalQuantity) * 100)
            : 0;

        return {
            ...month,
            growth,
            growthPercentage
        };
        });

        res.json({
        success: true,
        data: growthData,
        count: growthData.length,
        timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        error: 'Failed to fetch trends data',
        message: error.message
        });
    }
    });

    // GET /api/analytics/category-performance - Get detailed category performance
    router.get('/category-performance', (req, res) => {
    try {
        const analytics = donationService.getDonationsAnalytics();
        const categoryPerformance = analytics.categoryStats.map(stat => {
        const donations = donationService.getDonationsByCategory(
            donationService.getAllCategories().find(c => c.name === stat.category)?.id
        );
        
        return {
            ...stat,
            donationCount: donations.length,
            averageUsagePerDonation: donations.length > 0 
            ? Math.round(stat.totalUsed / donations.length)
            : 0,
            status: stat.usagePercentage > 70 ? 'High Usage' 
                : stat.usagePercentage > 40 ? 'Medium Usage' 
                : 'Low Usage'
        };
        });

        res.json({
        success: true,
        data: categoryPerformance,
        count: categoryPerformance.length,
        timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        error: 'Failed to fetch category performance',
        message: error.message
        });
    }
    });

    // GET /api/analytics/summary - Get key metrics summary
    router.get('/summary', (req, res) => {
    try {
        const analytics = donationService.getDonationsAnalytics();
        const runningLow = donationService.getRunningLowDonations();
        const topDonators = donationService.getTopDonators(3);
        
        const summary = {
        totalDonations: analytics.totalDonations,
        totalCategories: analytics.totalCategories,
        overallUsage: analytics.overallUsage,
        runningLowCount: runningLow.length,
        topDonator: topDonators[0]?.name || 'N/A',
        topCategory: analytics.categoryStats.reduce((prev, current) => 
            (prev.totalInitial > current.totalInitial) ? prev : current
        ).category,
        lastUpdated: new Date().toISOString()
        };

        res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        error: 'Failed to fetch summary',
        message: error.message
        });
    }
    });

    // GET /api/analytics/export - Get all analytics data for export
    router.get('/export', (req, res) => {
    try {
        const exportData = {
        overview: donationService.getDonationsAnalytics(),
        trends: donationService.getDonationsOverTime(),
        runningLow: donationService.getRunningLowDonations(),
        topDonators: donationService.getTopDonators(),
        genderDistribution: donationService.getDonationsByGender(),
        categories: donationService.getAllCategories(),
        donations: donationService.getAllDonations(),
        exportedAt: new Date().toISOString()
        };

        res.json({
        success: true,
        data: exportData,
        timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        error: 'Failed to export analytics data',
        message: error.message
        });
    }
    });

    module.exports = router;

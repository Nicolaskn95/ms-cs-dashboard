const { Donation, Category } = require('../models/Donation');

const categories = [
  new Category({
    id: 'cat-1',
    name: 'Roupas',
    measure_unity: 'peças'
  }),
  new Category({
    id: 'cat-2', 
    name: 'Alimentos',
    measure_unity: 'kg'
  }),
  new Category({
    id: 'cat-3',
    name: 'Brinquedos',
    measure_unity: 'unidades'
  }),
  new Category({
    id: 'cat-4',
    name: 'Livros',
    measure_unity: 'unidades'
  }),
  new Category({
    id: 'cat-5',
    name: 'Eletrônicos',
    measure_unity: 'unidades'
  })
];

// Mock donations data
const donations = [
  new Donation({
    id: 'don-1',
    category_id: 'cat-1',
    name: 'Camisetas',
    description: 'Camisetas em bom estado',
    initial_quantity: 150,
    current_quantity: 45,
    donator_name: 'João Silva',
    gender: 'Unissex',
    size: 'M/G',
    created_at: new Date('2024-01-15'),
    category: categories[0]
  }),
  new Donation({
    id: 'don-2',
    category_id: 'cat-1',
    name: 'Calças',
    description: 'Calças jeans e sociais',
    initial_quantity: 80,
    current_quantity: 25,
    donator_name: 'Maria Santos',
    gender: 'Feminino',
    size: '36-42',
    created_at: new Date('2024-01-20'),
    category: categories[0]
  }),
  new Donation({
    id: 'don-3',
    category_id: 'cat-2',
    name: 'Arroz',
    description: 'Arroz tipo 1',
    initial_quantity: 200,
    current_quantity: 80,
    donator_name: 'Padaria Central',
    created_at: new Date('2024-02-01'),
    category: categories[1]
  }),
  new Donation({
    id: 'don-4',
    category_id: 'cat-2',
    name: 'Feijão',
    description: 'Feijão carioca',
    initial_quantity: 150,
    current_quantity: 30,
    donator_name: 'Supermercado ABC',
    created_at: new Date('2024-02-05'),
    category: categories[1]
  }),
  new Donation({
    id: 'don-5',
    category_id: 'cat-3',
    name: 'Brinquedos Educativos',
    description: 'Brinquedos para crianças de 3-8 anos',
    initial_quantity: 60,
    current_quantity: 15,
    donator_name: 'Loja de Brinquedos',
    created_at: new Date('2024-02-10'),
    category: categories[2]
  }),
  new Donation({
    id: 'don-6',
    category_id: 'cat-4',
    name: 'Livros Infantis',
    description: 'Livros para crianças',
    initial_quantity: 120,
    current_quantity: 70,
    donator_name: 'Biblioteca Municipal',
    created_at: new Date('2024-02-15'),
    category: categories[3]
  }),
  new Donation({
    id: 'don-7',
    category_id: 'cat-5',
    name: 'Smartphones',
    description: 'Smartphones usados em bom estado',
    initial_quantity: 25,
    current_quantity: 5,
    donator_name: 'Tech Store',
    created_at: new Date('2024-02-20'),
    category: categories[4]
  })
];

class DonationService {
  
  // Get all donations
  getAllDonations() {
    return donations.map(donation => donation.toJSON());
  }

  // Get donations by category
  getDonationsByCategory(categoryId) {
    return donations
      .filter(donation => donation.category_id === categoryId)
      .map(donation => donation.toJSON());
  }

  // Get all categories
  getAllCategories() {
    return categories.map(category => category.toJSON());
  }

  // Get donations analytics for charts
  getDonationsAnalytics() {
    const categoryStats = categories.map(category => {
      const categoryDonations = donations.filter(d => d.category_id === category.id);
      const totalInitial = categoryDonations.reduce((sum, d) => sum + d.initial_quantity, 0);
      const totalCurrent = categoryDonations.reduce((sum, d) => sum + d.current_quantity, 0);
      const totalUsed = totalInitial - totalCurrent;
      
      return {
        category: category.name,
        totalInitial,
        totalCurrent,
        totalUsed,
        usagePercentage: totalInitial > 0 ? Math.round((totalUsed / totalInitial) * 100) : 0,
        measureUnity: category.measure_unity
      };
    });

    return {
      categoryStats,
      totalDonations: donations.length,
      totalCategories: categories.length,
      overallUsage: this.calculateOverallUsage()
    };
  }

  // Get donations over time (monthly data for line chart)
  getDonationsOverTime() {
    const monthlyData = {};
    
    donations.forEach(donation => {
      const month = donation.created_at.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          totalDonations: 0,
          totalQuantity: 0,
          categories: {}
        };
      }
      
      monthlyData[month].totalDonations++;
      monthlyData[month].totalQuantity += donation.initial_quantity;
      
      if (!monthlyData[month].categories[donation.category.name]) {
        monthlyData[month].categories[donation.category.name] = 0;
      }
      monthlyData[month].categories[donation.category.name] += donation.initial_quantity;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  // Get running low donations (for alerts)
  getRunningLowDonations() {
    return donations
      .filter(donation => donation.isRunningLow())
      .map(donation => donation.toJSON());
  }

  // Get donations by gender (for pie chart)
  getDonationsByGender() {
    const genderStats = {};
    
    donations.forEach(donation => {
      const gender = donation.gender || 'Não especificado';
      if (!genderStats[gender]) {
        genderStats[gender] = 0;
      }
      genderStats[gender] += donation.initial_quantity;
    });

    return Object.entries(genderStats).map(([gender, quantity]) => ({
      gender,
      quantity,
      percentage: Math.round((quantity / donations.reduce((sum, d) => sum + d.initial_quantity, 0)) * 100)
    }));
  }

  // Get top donators
  getTopDonators(limit = 5) {
    const donatorStats = {};
    
    donations.forEach(donation => {
      const donator = donation.donator_name || 'Anônimo';
      if (!donatorStats[donator]) {
        donatorStats[donator] = {
          name: donator,
          totalQuantity: 0,
          totalDonations: 0
        };
      }
      donatorStats[donator].totalQuantity += donation.initial_quantity;
      donatorStats[donator].totalDonations++;
    });

    return Object.values(donatorStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  // Calculate overall usage percentage
  calculateOverallUsage() {
    const totalInitial = donations.reduce((sum, d) => sum + d.initial_quantity, 0);
    const totalCurrent = donations.reduce((sum, d) => sum + d.current_quantity, 0);
    const totalUsed = totalInitial - totalCurrent;
    
    return {
      totalInitial,
      totalCurrent,
      totalUsed,
      usagePercentage: totalInitial > 0 ? Math.round((totalUsed / totalInitial) * 100) : 0
    };
  }

  // Get chart-ready data for different chart types
  getChartData(chartType) {
    switch (chartType) {
      case 'category-pie':
        return this.getDonationsAnalytics().categoryStats.map(stat => ({
          label: stat.category,
          value: stat.totalInitial,
          percentage: Math.round((stat.totalInitial / donations.reduce((sum, d) => sum + d.initial_quantity, 0)) * 100)
        }));
      
      case 'usage-bar':
        return this.getDonationsAnalytics().categoryStats.map(stat => ({
          category: stat.category,
          used: stat.totalUsed,
          available: stat.totalCurrent,
          usagePercentage: stat.usagePercentage
        }));
      
      case 'monthly-line':
        return this.getDonationsOverTime();
      
      case 'gender-pie':
        return this.getDonationsByGender();
      
      default:
        return this.getDonationsAnalytics();
    }
  }
}

module.exports = new DonationService();

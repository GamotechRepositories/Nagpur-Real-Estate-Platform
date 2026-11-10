import 'package:flutter/material.dart';
import '../core/network/api_client.dart';
import '../models/property_model.dart';
import '../models/locality_model.dart';
import '../models/project_model.dart';
import '../models/agent_model.dart';

class PropertyProvider with ChangeNotifier {
  List<PropertyModel> _properties = [];
  List<PropertyModel> _featuredProperties = [];
  List<PropertyModel> _verifiedProperties = [];
  List<LocalityModel> _localities = [];
  List<ProjectModel> _projects = [];
  List<AgentModel> _agents = [];

  bool _isLoading = false;
  int _totalCount = 0;
  int _currentPage = 1;
  int _totalPages = 1;

  // Search Filters
  String _activeTab = 'Buy'; // 'Buy', 'Rent', 'Plots', 'Commercial'
  String _selectedLocality = '';
  String _selectedPropertyType = '';
  String _selectedBudget = '';
  String _selectedBedrooms = '';
  String _selectedSort = 'latest';

  List<PropertyModel> get properties => _properties;
  List<PropertyModel> get featuredProperties => _featuredProperties;
  List<PropertyModel> get verifiedProperties => _verifiedProperties;
  List<LocalityModel> get localities => _localities;
  List<ProjectModel> get projects => _projects;
  List<AgentModel> get agents => _agents;

  bool get isLoading => _isLoading;
  int get totalCount => _totalCount;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;

  String get activeTab => _activeTab;
  String get selectedLocality => _selectedLocality;
  String get selectedPropertyType => _selectedPropertyType;
  String get selectedBudget => _selectedBudget;
  String get selectedBedrooms => _selectedBedrooms;
  String get selectedSort => _selectedSort;

  void setActiveTab(String tab) {
    _activeTab = tab;
    notifyListeners();
  }

  void setFilters({
    String? locality,
    String? propertyType,
    String? budget,
    String? bedrooms,
    String? sort,
  }) {
    if (locality != null) _selectedLocality = locality;
    if (propertyType != null) _selectedPropertyType = propertyType;
    if (budget != null) _selectedBudget = budget;
    if (bedrooms != null) _selectedBedrooms = bedrooms;
    if (sort != null) _selectedSort = sort;
    notifyListeners();
  }

  void clearFilters() {
    _selectedLocality = '';
    _selectedPropertyType = '';
    _selectedBudget = '';
    _selectedBedrooms = '';
    _selectedSort = 'latest';
    notifyListeners();
  }

  Future<void> fetchHomeData() async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Featured Properties
      final featuredRes = await ApiClient().dio.get('/properties', queryParameters: {
        'isFeatured': 'true',
        'limit': 6,
      });
      final featuredData = featuredRes.data?['data'] as List<dynamic>? ?? [];
      _featuredProperties =
          featuredData.map((p) => PropertyModel.fromJson(p)).toList();

      // 2. Verified Properties
      final verifiedRes = await ApiClient().dio.get('/properties', queryParameters: {
        'isVerified': 'true',
        'limit': 6,
      });
      final verifiedData = verifiedRes.data?['data'] as List<dynamic>? ?? [];
      _verifiedProperties =
          verifiedData.map((p) => PropertyModel.fromJson(p)).toList();

      // 3. Localities
      final locRes = await ApiClient().dio.get('/localities');
      final locData = locRes.data?['data'] as List<dynamic>? ?? [];
      _localities = locData.map((l) => LocalityModel.fromJson(l)).toList();

      // 4. Projects
      final projRes = await ApiClient().dio.get('/projects');
      final projData = projRes.data?['data'] as List<dynamic>? ?? [];
      _projects = projData.map((pj) => ProjectModel.fromJson(pj)).toList();

      // 5. Agents
      final agRes = await ApiClient().dio.get('/agents');
      final agData = agRes.data?['data'] as List<dynamic>? ?? [];
      _agents = agData.map((a) => AgentModel.fromJson(a)).toList();
    } catch (_) {
      // Handle network errors gracefully
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchProperties({int page = 1}) async {
    _isLoading = true;
    _currentPage = page;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': 12,
        'sort': _selectedSort,
      };

      if (_activeTab == 'Rent') {
        queryParams['purpose'] = 'RENT';
      } else if (_activeTab == 'Plots') {
        queryParams['category'] = 'PLOT';
        queryParams['purpose'] = 'BUY';
      } else if (_activeTab == 'Commercial') {
        queryParams['category'] = 'COMMERCIAL';
      } else {
        queryParams['purpose'] = 'BUY';
      }

      if (_selectedLocality.isNotEmpty) {
        final cleanLoc = _selectedLocality.replaceAll(', Nagpur', '').trim();
        queryParams['locality'] = cleanLoc;
      }

      if (_selectedPropertyType.isNotEmpty) {
        queryParams['subtype'] = _selectedPropertyType;
      }

      if (_selectedBedrooms.isNotEmpty) {
        queryParams['bedrooms'] = _selectedBedrooms;
      }

      if (_selectedBudget.isNotEmpty) {
        final parts = _selectedBudget.split('-');
        if (parts.isNotEmpty && parts[0].isNotEmpty) {
          queryParams['minPrice'] = parts[0];
        }
        if (parts.length > 1 && parts[1].isNotEmpty) {
          queryParams['maxPrice'] = parts[1];
        }
      }

      final res = await ApiClient().dio.get(
        '/properties',
        queryParameters: queryParams,
      );

      final dataList = res.data?['data'] as List<dynamic>? ?? [];
      _properties = dataList.map((p) => PropertyModel.fromJson(p)).toList();

      final meta = res.data?['meta'];
      if (meta != null) {
        _totalCount = int.tryParse(meta['totalCount']?.toString() ?? '0') ?? _properties.length;
        _totalPages = int.tryParse(meta['totalPages']?.toString() ?? '1') ?? 1;
      } else {
        _totalCount = _properties.length;
        _totalPages = 1;
      }
    } catch (_) {
      _properties = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<PropertyModel?> fetchPropertyBySlug(String slug) async {
    try {
      final res = await ApiClient().dio.get('/properties/details/$slug');
      final data = res.data?['data'];
      if (data != null) {
        return PropertyModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }

  Future<List<PropertyModel>> fetchSimilarProperties(String propertyId) async {
    try {
      final res = await ApiClient().dio.get('/properties/$propertyId/similar');
      final list = res.data?['data'] as List<dynamic>? ?? [];
      return list.map((p) => PropertyModel.fromJson(p)).toList();
    } catch (_) {
      return [];
    }
  }
}


# Dashboard Dataviz V2 - Dokumentasi Proyek

## Deskripsi Umum
Dashboard Dataviz V2 adalah aplikasi Angular untuk visualisasi data yang menggunakan GraphQL sebagai backend dan berbagai library charting untuk menampilkan data dalam bentuk grafik dan dashboard interaktif.

## Struktur Folder Utama

### 📁 `src/@dataviz/` - Core Library
Folder ini berisi library inti untuk aplikasi dataviz.

#### 📂 `graphql/`
- **`client.ts`**: Client GraphQL untuk komunikasi dengan backend
- **`graphql.ts`**: Konfigurasi Apollo Client dengan authentication
- **`mutations/`**: GraphQL mutations untuk operasi create/update/delete
  - `dashboard-builder/`: Mutations untuk dashboard builder
  - `users/`: Mutations untuk manajemen user
- **`queries/`**: GraphQL queries untuk mengambil data
  - `dashboard-builder/`: Queries untuk dashboard builder
  - `users/`: Queries untuk data user

#### 📂 `services/`
- **`config/`**: Konfigurasi aplikasi dan konstanta
- **`confirmation/`**: Service untuk dialog konfirmasi
- **`loading/`**: Service untuk loading state management
- **`media-watcher/`**: Service untuk responsive design
- **`platform/`**: Service untuk deteksi platform
- **`splash-screen/`**: Service untuk splash screen
- **`utils/`**: Utility functions

#### 📂 `repositories/`
- **`repository.factory.ts`**: Factory pattern untuk membuat repository instances
- **`dashboard-builder/`**: Repository untuk dashboard builder operations
- **`users/`**: Repository untuk user operations

### 📁 `src/app/` - Aplikasi Angular

#### 📂 `core/`
- **`auth/`**: 
  - `auth.guard.ts`: Route guard untuk proteksi halaman
  - `auth.service.ts`: Service autentikasi dengan dummy users

#### 📂 `modules/`

##### 📂 `admin/` - Modul Admin
**Components:**
- **`admin-layout/`**: Layout utama untuk halaman admin
- **`chart-type-selection-dialog/`**: Dialog untuk memilih tipe chart
- **`dashboard-form-dialog/`**: Dialog form untuk membuat/edit dashboard
- **`section-form-dialog/`**: Dialog form untuk section management
- **`theme-selector-dialog/`**: Dialog untuk memilih tema
- **`user-form-dialog/`**: Dialog form untuk user management
- **`widget-config-dialog/`**: Dialog konfigurasi widget
- **`widget-form-dialog/`**: Dialog form untuk widget
- **`widget-setting-dialog/`**: Dialog pengaturan widget

**Pages:**
- **`dashboard-builder/`**: Halaman untuk membangun dashboard
  - `dashboard-builder.component.*`: Main component
  - `dashboard-builder.service.ts`: Business logic
  - `dashboard-builder.types.ts`: Type definitions
  - `data.dashboard.json`: Sample dashboard data
- **`dashboard-list/`**: Halaman daftar dashboard
- **`user-management/`**: Halaman manajemen user
- **`section-settings/`**: Halaman pengaturan section
- **`widget-settings/`**: Halaman pengaturan widget

##### 📂 `auth/` - Modul Autentikasi
- **`login/`**: Komponen halaman login dengan form validation

##### 📂 `dashboard/` - Modul Dashboard
**Charts Components:**
- **`bar-chart-widget.component.ts`**: Widget bar chart
- **`bar-chart-widget-contrat.component.ts`**: Bar chart khusus kontrak
- **`bar-chart-widget-ouvert.component.ts`**: Bar chart khusus ouvert
- **`bar-chart-widget-top.component.ts`**: Bar chart top performers
- **`breakdown-chart-widget.component.ts`**: Chart breakdown data
- **`column-chart-widget.component.ts`**: Widget column chart
- **`line-chart-widget.component.ts`**: Widget line chart
- **`map-widget.component.ts`**: Widget peta
- **`metric-widget.component.ts`**: Widget metrik
- **`pictorial-fraction-chart.component.ts`**: Chart pictorial fraction
- **`pie-chart-widget.component.ts`**: Widget pie chart
- **`sankey-chart-widget.component.ts`**: Widget sankey chart
- **`simple-table-widget.component.ts`**: Widget tabel sederhana
- **`status-grid-widget.component.ts`**: Widget grid status
- **`text-widget.component.ts`**: Widget teks

#### 📂 `shared/` - Komponen Bersama

##### 📂 `components/`
**Action Dialogs:**
- **`information-dialog/`**: Dialog informasi
- **`scope-dialog/`**: Dialog scope selection

**UI Components:**
- **`actions-buttons/`**: Komponen tombol aksi
- **`section/`**: Komponen section
- **`sections/`**: Komponen sections management

**Widget Components:**
- **`widget/`**: Base widget components
  - `chart-widget.component.ts`: Base chart widget
  - `metric-card-widget.component.ts`: Metric card widget
  - `widget-factory.component.ts`: Factory untuk membuat widget
  - `widget.component.ts`: Base widget component

**Widgets Library:**
- **`animated-gauge-widget/`**: Widget gauge animasi
- **`bar-chart-widget/`**: Widget bar chart
- **`column-chart-widget/`**: Widget column chart
- **`donut-chart-widget/`**: Widget donut chart
- **`line-chart-widget/`**: Widget line chart
- **`map-widget/`**: Widget peta
- **`metric-widget/`**: Widget metrik
- **`pictorial-fraction-chart/`**: Chart pictorial fraction
- **`pie-chart-widget/`**: Widget pie chart
- **`radar-chart-widget/`**: Widget radar chart
- **`sankey-chart-widget/`**: Widget sankey chart
- **`simple-table-widget/`**: Widget tabel sederhana
- **`status-grid-widget/`**: Widget grid status
- **`text-widget/`**: Widget teks
- **`world-map-widget/`**: Widget peta dunia
- **`yes-no-gauge-widget/`**: Widget gauge yes/no

##### 📂 `services/`
- **`auth.service.ts`**: Service autentikasi shared
- **`dashboard.service.ts`**: Service untuk dashboard operations
- **`share-data.service.ts`**: Service untuk sharing data antar komponen
- **`widget.service.ts`**: Service untuk widget operations

##### 📂 `models/`
- **`widget.types.ts`**: Type definitions untuk widget

### 📁 `src/environments/` - Environment Configuration
- **`environment.ts`**: Konfigurasi development
- **`environment.prod.ts`**: Konfigurasi production

**Konfigurasi Backend:**
```typescript
apiGraphqlUrl: 'https://alumni-back-end-production.up.railway.app/graphql'
tokenKey: 'token'
userProfileKey: 'NEXTERA_USER_PROFILE'
```

## File Konfigurasi Utama

### 📄 `package.json`
Dependencies utama:
- **Angular 19**: Framework frontend
- **Apollo Client**: GraphQL client
- **AmCharts5**: Library charting
- **ApexCharts**: Library charting alternatif
- **Angular Material**: UI components
- **Bootstrap**: CSS framework
- **TailwindCSS**: Utility-first CSS

### 📄 `angular.json`
Konfigurasi build Angular dengan:
- Development server: `ng serve`
- Production build: `ng build`
- Testing: `ng test`

### 📄 `tailwind.config.js`
Konfigurasi TailwindCSS untuk styling

## Fitur Utama

### 🔐 Autentikasi
- Login dengan email/password
- JWT token management
- Route guards untuk proteksi halaman
- Session management

### 📊 Dashboard Builder
- Drag & drop interface
- Multiple chart types (bar, line, pie, sankey, etc.)
- Widget configuration
- Section management
- Theme selection

### 📈 Visualisasi Data
- **Charts**: Bar, Line, Pie, Column, Donut, Radar, Sankey
- **Maps**: World map, custom maps
- **Widgets**: Metrics, gauges, tables, text
- **Interactive**: Responsive dan interactive charts

### 👥 User Management
- CRUD operations untuk users
- Role-based access control
- User profile management

## Teknologi Stack

### Frontend
- **Angular 19** - Framework utama
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **Angular Material** - UI components
- **TailwindCSS + Bootstrap** - Styling

### Data Visualization
- **AmCharts5** - Advanced charting
- **ApexCharts** - Alternative charting
- **ng-apexcharts** - Angular wrapper

### Backend Communication
- **GraphQL** - API query language
- **Apollo Client** - GraphQL client
- **apollo-upload-client** - File upload support

### Development Tools
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Karma + Jasmine** - Testing framework

## Cara Menjalankan

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development server
npm start
# atau
ng serve

# Build production
npm run build
# atau
ng build --prod

# Testing
npm test
# atau
ng test
```

## Akses Login

**Dummy Users (untuk development):**
- Email: `admin@rdc.cd` | Password: `password`
- Email: `manager@rdc.cd` | Password: `password`
- Email: `analyst@rdc.cd` | Password: `password`

**Note**: Aplikasi terhubung ke backend GraphQL production, sehingga memerlukan user yang terdaftar di database backend.

## Struktur Routing

- `/login` - Halaman login
- `/admin/dashboard-list` - Daftar dashboard
- `/admin/dashboard-builder` - Dashboard builder
- `/admin/user-management` - Manajemen user
- `/dashboard/:id` - View dashboard

## Tips Development

1. **Widget Development**: Semua widget berada di `shared/components/widgets/`
2. **Chart Integration**: Gunakan AmCharts5 atau ApexCharts sesuai kebutuhan
3. **State Management**: Gunakan services di `shared/services/`
4. **GraphQL**: Queries dan mutations berada di `@dataviz/graphql/`
5. **Styling**: Kombinasi TailwindCSS dan Angular Material
6. **Responsive**: Gunakan `media-watcher.service.ts` untuk responsive handling

---

*Dokumentasi ini dibuat untuk membantu developer memahami struktur dan fungsi setiap komponen dalam proyek Dashboard Dataviz V2.*
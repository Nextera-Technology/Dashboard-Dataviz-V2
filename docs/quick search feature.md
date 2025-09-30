# QuickSearch Layout Recommendations

Based on the reference image and UX best practices, here are the recommended layouts for each category:

## 🧑‍💼 USER Category
**Layout Type**: `list`
**Display Style**: Avatar-based list with badges

```
┌─────────────────────────────────────────────────────────┐
│ [👤] John Doe                                     [🔧] │
│      john.doe@example.com                               │
│      Administrator • Recently active                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [avatarUrl]   title                                [🔧] │
│               subtitle                                  │
│               roleName - status                         │
└─────────────────────────────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Full name (title), email (subtitle)
- **Secondary**: Role (roleName), last activity
- **Avatar**: Profile picture (avatarUrl)
- **Badges**: Role name, status
- **Actions**: View Profile, manage

**Color Scheme**: Blue (#3B82F6)

---

## 📊 ES_DASHBOARD Category
**Layout Type**: `card`
**Display Style**: Card layout with status indicators

```
┌─────────────────────────────────────────────────────────┐
│ [📊] Employability Survey 2024        [Active] [Live]   │
│      Dashboard Name                                     │
│      Employability Survey Dashboard • Last updated      │
│      [Open Dashboard] [manage] [Duplicate]                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ [📊]  title      [isArchived ? 'Archived' : 'Active'] [dashboardType]   │
│       subtitle                                                          │
│       certification | classes • updatedAt                               │
│      [Open Dashboard] [manage] [Duplicate]                                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Dashboard title (title), name (subtitle)
- **Secondary**: Type (dashboardType), last updated(updatedAt)
- **Icon**: Chart/dashboard icon
- **Badges**: Status (Active/Archived), Type (Live/Template)
- **Actions**: Open Dashboard, manage, Duplicate

**Color Scheme**: Green (#10B981)

---

## 💼 JOB_DESC_DASHBOARD Category
**Layout Type**: `card`
**Display Style**: Card layout with job-specific indicators

```
┌─────────────────────────────────────────────────────────┐
│ [💼] Job Analysis Dashboard           [Active] [JD]     │
│      Job Description Analysis                           │
│      Job Description Dashboard • Last updated           │
│      [Open Dashboard] [manage] [Export]                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ [💼]  title       [isArchived ? 'Archived' : 'Active'] [dashboardType]  │
│       subtitle                                                          │
│       certification | classes • updatedAt                               │
│      [Open Dashboard] [manage] [Duplicate]                                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Dashboard title (title), name (subtitle)
- **Secondary**: Certification, class, last updated
- **Icon**: Briefcase icon
- **Badges**: Status, Dashboard type
- **Actions**: Open Dashboard, manage, Export Report

**Color Scheme**: Amber (#F59E0B)

---

## 📋 SECTION Category
**Layout Type**: `grid`
**Display Style**: Grid cards grouped by dashboard

```
┌─────────────────────────┐ ┌─────────────────────────┐
│ [📋] Demographics       │ │ [📋] Skills Analysis    │
│      Section Name       │ │      Section Name       │
│      Dashboard: ES 2024 │ │      Dashboard: ES 2024 │
│      [View] [manage]      │ │      [View] [manage]      │
└─────────────────────────┘ └─────────────────────────┘

┌────────────────────────────────┐ ┌────────────────────────────────┐
│ [📋]  title                    │ │ [📋]  title                    │
│       subtitle                 │ │       subtitle                 │
│       Dashboard: dashboardName │ │       Dashboard: dashboardName │
│       certification - classes  │ │       certification - classes  │
│       [View] [manage]            │ │       [View] [manage]            │
└────────────────────────────────┘ └────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Section title (title), name (subtitle)
- **Secondary**: Parent dashboard name (dashboardName)
- **Icon**: Layout grid icon
- **Badges**: Status, Widget count
- **Actions**: View Section, manage, Add Widget
- **Grouping**: By dashboard name

**Color Scheme**: Violet (#8B5CF6)

---

## 🧩 WIDGET Category
**Layout Type**: `grid`
**Display Style**: Grid cards grouped by section

```
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│ [🧩] Age Distribution             │ │ [🧩] Gender Chart                │
│      Further Studies - Comparison │ │      Further Studies - Comparison │
│      Chart: Pie Chart             │ │      Chart: Bar Chart             │
│      Section: Demo                │ │      Section: Demo                │
│      Dashboard: RDC Dashboard     │ │      Dashboard: RDC Dashboard     │
│      RDC - 2022                   │ │      RDC - 2022                   │
│      [View] [manage]                │ │      [View] [manage]                │
└───────────────────────────────────┘ └───────────────────────────────────┘

┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│ [🧩] title                      │ │ [🧩] title                      │
│      widgetType - widgetSubType │ │      widgetType - widgetSubType │
│      Chart: chartType           │ │      Chart: chartType           │
│      Section: parentName        │ │      Section: parentName        │
│      dashboard: dashboardName   | │      dashboard: dashboardName   |
│      certification - classes    │ │      certification - classes    │
│      [View] [manage]              │ │      [View] [manage]              │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Widget title (title), name (subtitle)
- **Secondary**: Chart type (chartType), parent section (parentName)
- **Icon**: Puzzle piece icon
- **Badges**: Chart type, Status
- **Actions**: View Widget, manage, Duplicate
- **Grouping**: By section name

**Color Scheme**: Red (#EF4444)

---

## 🎓 STUDENT Category
**Layout Type**: `list`
**Display Style**: List with school badges (similar to reference image)

```
┌───────────────────────────────────────────────────────────┐
│ [🎓] DUPONT Adrien - A11591                [ICART] [🔧]  │
│      adrien.dupont1pro@gmail.com                          │
│      ICART - Master Digital Marketing • Student record    │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ [🎓] title                [school] [🔧]  │
│      subtitle                             │
│      certification - classes              │
└───────────────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Full name (title), email (subtitle)
- **Secondary**: Certification (certification), class (classess), school (school)
- **Icon**: Academic cap
- **Badges**: School name, Certification
- **Actions**: View Profile, manage, Contact
- **Grouping**: By school

**Color Scheme**: Cyan (#06B6D4)

---

## 🛡️ USER_TYPE Category
**Layout Type**: `list`
**Display Style**: Simple list with permission indicators

```
┌─────────────────────────────────────────────────────────┐
│ [🛡️] Administrator                    [15 permissions]  │
│      User Role                                          │
│      Full system access • Active role                   │
│      [View Permissions] [manage] [Assign Users]           │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ [🛡️] title                    [coming soon]    │
│      status                                    │
│      [View Permissions] [manage] [Assign Users]  │
└────────────────────────────────────────────────┘
```

**Key Fields**:
- **Primary**: Role name (title)
- **Secondary**: Description (coming soon), permission count (coming soon)
- **Icon**: Shield check
- **Badges**: Permission count, Status
- **Actions**: View Permissions, manage, Assign Users

**Color Scheme**: Lime (#84CC16)

---

## 🎨 General UX Recommendations

### Tab Design
- Use category icons with labels
- Show result counts in tabs: `Users (15)`
- Highlight active tab with category color
- Use consistent spacing and typography

### Search Results
- **Relevance Scoring**: Sort by relevance score within each category
- **Highlighting**: Highlight matching text in results
- **Loading States**: Show skeleton loaders while searching
- **Empty States**: Show helpful messages when no results found

### Responsive Design
- **Desktop**: Full card/list layouts
- **Tablet**: Condensed cards in grid
- **Mobile**: Stack to single column list

### Accessibility
- **Keyboard Navigation**: Tab through results
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Meet WCAG standards
- **Focus Indicators**: Clear focus states

### Performance
- **Lazy Loading**: Load more results on scroll
- **Debounced Search**: Wait for user to stop typing
- **Caching**: Cache recent searches
- **Pagination**: Limit initial results, load more on demand

This layout system provides a rich, category-specific user experience while maintaining consistency across the application
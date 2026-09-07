import { useState, useEffect } from "react";
import { getCategories } from "@/services/categoryService";

import type { CategoryNavigationItem } from "@/types/categories";
import type { CourseCardItem } from "@/types/course";
import { useNavigate } from "react-router-dom";
// import { getCourses } from "@/services/courseService";
import { useCoursesStore } from "@/store/courseStore";
import { CategoryNavigation } from "@/components/category-navigation/CategoryNavigation";
import { CourseCard } from "@/components/courses/CourseCard";

export function CourseListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryNavigationItem[]>([]);
  // const [courses, setCourses] = useState<CourseCardItem[]>([]);
  const { courses, loaded, loading, fetchCourses, toggleFavorite } = useCoursesStore();
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryNavigationItem["id"]>();

  useEffect(() => {
    getCategories().then(setCategories);
  }, [])

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading && !loaded) return <div className="w-full h-full text-center">Loading...</div>



  const handleCategorySelect = (
    category: CategoryNavigationItem
  ) => {
    setSelectedCategoryId(category.id);
  };

  const handleFavoriteChange = (
    selectedCourse: CourseCardItem
  ) => {
    toggleFavorite(selectedCourse.id);
  };

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );

  // Filter by category (if clicked) and sort APPROVED courses first
  const filteredCourses = courses
    .filter((course) => {
      if (!selectedCategoryId) return true;
      return String(course.categoryId) === String(selectedCategoryId);
    })
    .sort((a, b) => {
      if (a.approvalStatus === 'APPROVED' && b.approvalStatus !== 'APPROVED') return -1;
      if (a.approvalStatus !== 'APPROVED' && b.approvalStatus === 'APPROVED') return 1;
      return 0;
    });

  return (
    <div className="flex flex-col items-center m-4 text-center rounded-sm">

      {/* Header */}
      <div className="my-8 max-w-[67rem]">
        <h1 className="text-[2.25rem] font-bold leading-[2] text-slate-900 font-kantumruy">
          វគ្គសិក្សាបណ្តុះបណ្តាលផ្នែកបច្ចេកវិទ្យាឌីជីថល
        </h1>

        <p className="max-w-[58rem] text-[1.2rem] leading-[1.9] text-slate-900 font-kantumruy">
          រៀនជំនាញបច្ចេកទេសដែលសមស្របនឹងទេពកោសល្យរបស់អ្នក។ ប្រសិនបើអ្នកមិនច្បាស់ថាគួររៀនជំនាញណា សូមស្វាគមន៍ក្នុងការស្វាងយល់វគ្គសិក្សាដែលមាននៅទីនេះ ឬលទ្ធផលក្រុម CamCyber ដោយស្នើសុំការប្រឹក្សាយោបល់។
        </p>
      </div>

      {/* Category navigation */}
      <CategoryNavigation
        items={categories}
        selectedId={selectedCategoryId}
        onSelect={handleCategorySelect}
        onSortClick={() => {
          // TODO: Implement category sort functionality
        }}
        onFavoritesClick={() => {
          // TODO: Implement favorites filter
        }}
      />

      {/* Selected category */}
      <div className="p-6 text-slate-700 font-kantumruy">
        {selectedCategory
          ? `បង្ហាញ ${selectedCategory.name} វគ្គសិក្សា`
          : "សូមជ្រើសរើសលក្ខណៈវិនិច្ឆ័យវគ្គសិក្សា"}
      </div>

      {/* Courses */}
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={(selectedCourse) => {
              navigate(`/trainee/programs/${selectedCourse.id}`);
            }}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>
    </div>
  );
}
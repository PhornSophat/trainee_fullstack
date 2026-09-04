import { useState, useEffect } from "react";
import { CategoryNavigation } from "@/components/category-navigation/CategoryNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
// import { mockCategories } from "@/data/categories.mock";
import { getCategories } from "@/services/categoryService";
import { mockCourseData } from "@/data/courses.mock";
import type { CategoryNavigationItem } from "@/types/categories";
import type { CourseCardItem } from "@/types/course";

export function Overview() {
  const [ categories, setCategories ] = useState<CategoryNavigationItem[]>([]);
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryNavigationItem["id"]>();
  const [courses, setCourses] = useState<CourseCardItem[]>(mockCourseData);

  return (
    <div className="-m-6">
      <CategoryNavigation
        items={categories}
        selectedId={selectedCategoryId}
        onSelect={(category) => setSelectedCategoryId(category.id)}
        onSortClick={() => console.log("Open category sort")}
        onFavoritesClick={() => console.log("Show favorite categories")}
      />
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={(selectedCourse) => console.log("Open course", selectedCourse.id)}
            onFavoriteChange={(selectedCourse) => {
              setCourses((currentCourses) =>
                currentCourses.map((courseItem) =>
                  courseItem.id === selectedCourse.id
                    ? { ...courseItem, isFavorite: !courseItem.isFavorite }
                    : courseItem
                )
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
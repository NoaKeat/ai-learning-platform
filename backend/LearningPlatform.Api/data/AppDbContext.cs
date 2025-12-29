using Microsoft.EntityFrameworkCore;
using LearningPlatform.Api.Models;

namespace LearningPlatform.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Prompt> Prompts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========= Relationships (FKs) =========

            // SubCategory -> Category (Many SubCategories to One Category)
            modelBuilder.Entity<SubCategory>()
                .HasOne(s => s.Category)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Prompt -> User (Many Prompts to One User)
            modelBuilder.Entity<Prompt>()
                .HasOne(p => p.User)
                .WithMany(u => u.Prompts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Prompt -> Category (Many Prompts to One Category)
            modelBuilder.Entity<Prompt>()
                .HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Prompt -> SubCategory (Many Prompts to One SubCategory)
            // Prompt -> SubCategory (Many Prompts to One SubCategory)
            modelBuilder.Entity<Prompt>()
                .HasOne(p => p.SubCategory)
                .WithMany(sc => sc.Prompts)     // ✅ במקום WithMany()
                .HasForeignKey(p => p.SubCategoryId)
                .OnDelete(DeleteBehavior.Restrict);


            // ========= Seed Data =========
            // חשוב: HasData חייב Id קבועים (כי EF מייצר INSERT/UPDATE לפי המפתחות).
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Science" },
                new Category { Id = 2, Name = "Tech" },
                new Category { Id = 3, Name = "Math" },
                new Category { Id = 4, Name = "History" }
            );

            // אופציונלי (מומלץ ל-MVP): Seed גם ל-SubCategories כדי שתוכלי לבחור ישר ב-UI
            modelBuilder.Entity<SubCategory>().HasData(
                // Science
                new SubCategory { Id = 1, Name = "Space",   CategoryId = 1 },
                new SubCategory { Id = 2, Name = "Biology", CategoryId = 1 },

                // Tech
                new SubCategory { Id = 3, Name = "AI",        CategoryId = 2 },
                new SubCategory { Id = 4, Name = "Web Dev",   CategoryId = 2 },

                // Math
                new SubCategory { Id = 5, Name = "Algebra",   CategoryId = 3 },
                new SubCategory { Id = 6, Name = "Calculus",  CategoryId = 3 },

                // History
                new SubCategory { Id = 7, Name = "Ancient",   CategoryId = 4 },
                new SubCategory { Id = 8, Name = "Modern",    CategoryId = 4 }
            );
        }
    }
}

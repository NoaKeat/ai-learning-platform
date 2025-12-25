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

            // כאן אפשר להוסיף קשרים ומפתחות זרים
            modelBuilder.Entity<SubCategory>()
                .HasOne(s => s.Category)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(s => s.CategoryId);

            modelBuilder.Entity<Prompt>()
                .HasOne(p => p.User)
                .WithMany(u => u.Prompts)
                .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<Prompt>()
                .HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId);

            modelBuilder.Entity<Prompt>()
                .HasOne(p => p.SubCategory)
                .WithMany()
                .HasForeignKey(p => p.SubCategoryId);
        }
    }
}

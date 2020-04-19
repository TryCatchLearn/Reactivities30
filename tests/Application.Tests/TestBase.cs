using System;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Tests
{
    public class TestBase
    {
        public DataContext GetDbContext(bool useSqlite = false)
        {
            var builder = new DbContextOptionsBuilder<DataContext>();
            if (useSqlite)
            {
                builder.UseSqlite("Data Source=:memory", x => { });
            }
            else
            {
                builder.UseInMemoryDatabase(Guid.NewGuid().ToString());
            }
            
            var dbContext = new DataContext(builder.Options);

            if (useSqlite)
            {
                dbContext.Database.OpenConnection();
            }

            dbContext.Database.EnsureCreated();

            return dbContext;
        }
    }
}
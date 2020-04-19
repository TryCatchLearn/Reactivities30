using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Application.Comments;
using Domain;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Application.Tests.Comments
{
    public class DeleteTest : TestBase
    {
        [Fact]
        public async void Should_Delete_Comment()
        {
            var context = GetDbContext();
            
            context.Activities.Add(new Activity {Id = 1, Title = "Test Activity 1", Comments = new List<Comment>
            {
                new Comment
                {
                    Id = 1,
                    Body = "test comment 1"
                },
                new Comment
                {
                    Id = 2,
                    Body = "test comment 2"
                }
            }});
            await context.Activities.AddAsync(new Activity {Id = 2, Title = "Test Activity 2"});
            await context.SaveChangesAsync();
            
            var sut = new Delete.Handler(context);
            var result = sut.Handle(new Delete.Command(1, 1), CancellationToken.None);

            var activity = await context.Activities.FirstOrDefaultAsync(x => x.Id == 1);
            
            Assert.Equal(1, activity.Comments.Count);
        }
    }
}
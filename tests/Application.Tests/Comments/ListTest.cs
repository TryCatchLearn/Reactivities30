using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Application.Comments;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Xunit;


namespace Application.Tests.Comments
{
    public class ListTest : TestBase
    {
        private readonly IMapper _mapper;
        public ListTest()
        {
            var mockMapper = new MapperConfiguration(cfg => cfg.AddProfile(new MappingProfile()));
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public async void Should_Return_List_Of_Comments()
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
            
            var sut = new List.Handler(context, _mapper);
            var result = await sut.Handle(new List.Query(1), CancellationToken.None);

            var activity = await context.Activities.FirstAsync(x => x.Id == 1);
            
            Assert.Equal(2, activity.Comments.Count);
            Assert.Equal("test comment 1", activity.Comments.First(x => x.Id == 1).Body);
        }
    }
}
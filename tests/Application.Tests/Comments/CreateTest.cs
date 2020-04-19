using System.Threading;
using Application.Comments;
using Application.Interfaces;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Application.Tests.Comments
{
    public class CreateTest : TestBase
    {
        private readonly IMapper _mapper;
        public CreateTest()
        {
            var mockMapper = new MapperConfiguration(cfg => cfg.AddProfile(new MappingProfile()));
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public void Should_Create_Comment()
        {
            // arrange
            var userAccessor = new Mock<IUserAccessor>();
            userAccessor.Setup(u => u.GetCurrentUsername()).Returns("test");
        
            var context = GetDbContext();
        
            context.Activities.Add(new Activity {Id = 1, Title = "Test Activity 1"});
            context.Activities.Add(new Activity {Id = 2, Title = "Test Activity 2"});

            context.Users.AddAsync(new AppUser
            {
                Id = 1,
                Email = "test@test.com",
                UserName = "test"
            });
            context.SaveChanges();

            var command = new Create.Command
            {
                ActivityId = 1,
                Comment = new Create.CommentData
                {
                    Body = "test comment"
                }
            };
        
            // act
            var sut = new Create.Handler(context, userAccessor.Object, _mapper);
            var result = sut.Handle(command, CancellationToken.None).Result;

            var activity = context.Activities.FirstOrDefaultAsync(x => x.Id == 1).Result;
        
            Assert.Equal("test comment", result.Body);
            Assert.Equal(1, activity.Comments.Count);
        }
    }
}
using System.Threading;
using Application.Activities;
using AutoMapper;
using Domain;
using Xunit;

namespace Application.Tests.Activities
{
    public class EditTest : TestBase
    {
        private readonly IMapper _mapper;

        public EditTest()
        {
            var mockMapper = new MapperConfiguration(cfg => {cfg.AddProfile(new MappingProfile());});
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public void Should_Be_Able_To_Edit_Activity()
        {
            var context = GetDbContext();
            context.Activities.Add(new Activity 
            {
                Id = 1, 
                Title = "Test Activity 1", 
                Description = "Test Description"  
            });
            context.SaveChanges();

            var activityData = new Edit.ActivityData
            {
                Title = "Updated Title"
            };
        
            const int id = 1;
            var sut = new Edit.Handler(context, _mapper);
            var result = sut.Handle(
                new Edit.Command{Id = id, Activity = activityData}, CancellationToken.None).Result;
        
            Assert.Equal("Updated Title", result.Title);
            Assert.Equal("Test Description", result.Description);
        }
    }
}